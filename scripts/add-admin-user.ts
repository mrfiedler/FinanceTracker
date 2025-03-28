import { storage } from '../server/storage';
import { hashPassword } from '../server/auth';

async function addAdminUser() {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername('admintesto');
    
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword('tryout2025');
    
    // Create admin user
    await storage.createUser({
      username: 'admintesto',
      password: hashedPassword,
      name: 'Admin User',
      email: 'admin@example.com',
      isAdmin: true
    });
    
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

addAdminUser();