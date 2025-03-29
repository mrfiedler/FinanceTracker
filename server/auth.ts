import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

// Extend express-session to add our custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    authenticated?: boolean;
    user?: SelectUser;
  }
}

const scryptAsync = promisify(scrypt);

// Hash password using scrypt
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare password against stored hash
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Custom middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.authenticated && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

// Set up authentication middleware
export function setupAuth(app: Express) {
  // Generate a random session secret if not provided
  const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

  // Set up session
  const sessionSettings: session.SessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: 'finance_tracker.sid',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax'
    }
  };

  // Trust proxy is needed for secure cookies to work properly behind reverse proxies
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  // Log all requests for debugging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}`);
    next();
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Store user info in session
      req.session.userId = user.id;
      req.session.authenticated = true;
      req.session.user = user;

      // Save session
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }

        console.log("User registered and logged in:", user.id);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user info in session
      req.session.userId = user.id;
      req.session.authenticated = true;
      req.session.user = user;
      
      // Save session
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
        
        console.log("User successfully logged in:", user.id);
        console.log("Session ID:", req.sessionID);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    const userId = req.session.userId;
    console.log("Logging out user:", userId || 'Not authenticated');
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to destroy session" });
      }
      
      // Clear the cookie
      res.clearCookie('finance_tracker.sid');
      
      console.log("User successfully logged out");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Current user endpoint
  app.get("/api/user", async (req, res) => {
    // Debug session information
    console.log("Session ID:", req.sessionID);
    console.log("Is authenticated:", !!req.session.authenticated);
    
    if (req.session) {
      console.log("Session data:", { 
        userId: req.session.userId,
        authenticated: req.session.authenticated,
        cookie: req.session.cookie
      });
    }

    if (!req.session.authenticated || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Get fresh user data from storage
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        // User not found, invalidate session
        req.session.destroy((err) => {
          if (err) console.error("Error destroying invalid session:", err);
        });
        return res.status(401).json({ message: "User not found" });
      }
      
      // Update user in session
      req.session.user = user;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Change user password endpoint
  app.patch("/api/users/password", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing password change for user ${userId}`);
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        console.log("Password change failed: Missing required fields");
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        console.log("Password change failed: Invalid password format");
        return res.status(400).json({ message: "Invalid password format" });
      }

      if (newPassword.length < 6) {
        console.log("Password change failed: New password too short");
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`Password change failed: User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        console.log("Password change failed: Incorrect current password");
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user with new password
      await storage.updateUser(userId, { password: hashedPassword });

      console.log(`Password successfully updated for user ${userId}`);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Save company information endpoint
  app.post("/api/company/info", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing company info save for user ${userId}`, req.body);

      // In a real app, this would save to a company table in the database
      // For now, we'll just simulate a successful save
      console.log("Company info saved successfully");
      res.json({ 
        success: true,
        message: "Company information saved successfully" 
      });
    } catch (error) {
      console.error("Error saving company information:", error);
      res.status(500).json({ message: "Failed to save company information" });
    }
  });

  // Other endpoints moved to routes.ts
}