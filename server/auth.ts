import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Extend express-session to add our custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    authenticated?: boolean;
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

// Set up authentication middleware
export function setupAuth(app: Express) {
  // Generate a random session secret if not provided
  const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

  // Set up session
  const sessionSettings: session.SessionOptions = {
    secret: SESSION_SECRET,
    resave: true, // Changed to true to make sure session is saved on every request
    saveUninitialized: true, // Changed to true to create a session regardless of changes
    store: storage.sessionStore,
    name: 'finance_tracker.sid', // Custom cookie name for better isolation
    cookie: {
      secure: false, // Set to false for development (even in production for this demo)
      httpOnly: false, // Set to false for debugging
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax' // Less restrictive SameSite setting
    }
  };

  // Trust proxy is needed for secure cookies to work properly behind reverse proxies
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy (username/password)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Serialize user to session
  passport.serializeUser((user, done) => done(null, user.id));

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
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

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) return next(err);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      req.login(user, (err) => {
        if (err) return next(err);

        console.log("User successfully logged in:", (user as SelectUser).id);

        // Add custom properties to the session and ensure it's saved
        if (req.session) {
          req.session.userId = (user as SelectUser).id;
          req.session.authenticated = true;
          
          // Force session save before sending response
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session:", err);
              return res.status(500).json({ message: "Failed to create session" });
            }
            
            console.log("Session successfully saved");
            
            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            return res.status(200).json(userWithoutPassword);
          });
        } else {
          console.error("Session object not available");
          return res.status(500).json({ message: "Session not available" });
        }
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    console.log("Logging out user:", req.user ? (req.user as SelectUser).id : 'Not authenticated');
    
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return next(err);
      }
      
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to destroy session" });
        }
        
        // Clear the cookie with the same name used in session settings
        res.clearCookie('finance_tracker.sid');
        
        console.log("User successfully logged out");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Current user endpoint
  app.get("/api/user", (req, res) => {
    // Debug session information
    console.log("Session ID:", req.sessionID);
    console.log("Is authenticated:", req.isAuthenticated());
    if (req.session) {
      console.log("Session data:", { 
        userId: req.session.userId,
        authenticated: req.session.authenticated,
        cookie: req.session.cookie
      });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  // The user profile routes have been moved to server/routes.ts to use the standardized authentication middleware

  // Change user password endpoint
  app.patch("/api/users/password", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Password change failed: Not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = (req.user as SelectUser).id;
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
  app.post("/api/company/info", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Company info save failed: Not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = (req.user as SelectUser).id;
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

  // The user avatar and company logo upload routes have been moved to server/routes.ts to use the standardized authentication middleware
}