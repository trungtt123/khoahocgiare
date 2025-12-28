import bcrypt from 'bcrypt';
import prisma from './utils/prisma';

async function createInitialAdmin() {
  try {
    // Check if any user exists
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log('Database already has users. Skipping initial admin creation.');
      return;
    }

    // Create initial admin user with simple credentials
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: adminUsername,
        password: passwordHash,
        role: 'admin',
        maxDevices: 10, // Admin gets higher device limit
      },
    });

    console.log('Initial admin user created successfully:');
    console.log('Username:', adminUsername);
    console.log('Password:', adminPassword);
    console.log('Role:', adminUser.role);
    console.log('');
    console.log('IMPORTANT: You can now create, edit, and delete admin/users through the admin interface at /admin');
    console.log('This initial admin account can be managed like any other user in the system.');
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialAdmin();
