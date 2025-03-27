import { db } from '../server/db';
import { users } from '../shared/schema';
import { hashPassword } from '../server/auth';

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUsers = await db.select().from(users).where(users.username === 'admintesto');
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists!');
      return;
    }

    const hashedPassword = await hashPassword('tryout2025');
    
    await db.insert(users).values({
      username: 'admintesto',
      password: hashedPassword,
      name: 'Admin User',
      email: 'admin@example.com',
      isAdmin: true
    });

    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();