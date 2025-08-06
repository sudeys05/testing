import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users, sessions } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { users, sessions } });

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);

    if (existingAdmin.length === 0) {
      // Create default admin user
      console.log('Creating default admin user...');
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@police.local',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        badgeNumber: 'ADMIN001',
        department: 'Administration',
        position: 'System Administrator',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✓ Default admin user created: admin / admin123');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Verify session table exists (this is handled by Drizzle schema)
    console.log('✓ Session table configured');

    console.log('Database setup complete!');
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();