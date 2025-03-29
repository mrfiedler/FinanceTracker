import { db } from '../server/db';
import { users } from '../shared/schema';
import { hashPassword } from '../server/auth';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    // First check if admin already exists to avoid duplicates
    const existingUser = await db.select().from(users).where(eq(users.username, 'admintesto'));
    
    if (existingUser.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    const hashedPassword = await hashPassword('tryout2025');
    const result = await db.insert(users).values({
      username: 'admintesto',
      password: hashedPassword,
      isAdmin: true,
      name: 'Admin User'
    }).returning();
    
    console.log('Admin user created successfully!', result[0]);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();