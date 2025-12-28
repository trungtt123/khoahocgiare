import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  try {
    // Delete all data in correct order (respecting foreign keys)
    console.log('🗑️  Deleting all devices...');
    await prisma.device.deleteMany({});

    console.log('🗑️  Deleting all videos...');
    await prisma.video.deleteMany({});

    console.log('🗑️  Deleting all users...');
    await prisma.user.deleteMany({});

    console.log('✅ All data deleted successfully');

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        maxDevices: 999, // Unlimited for admin
      },
    });

    console.log('✅ Admin user created:', admin.username);
    console.log('📋 Admin credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Max Devices: 999 (unlimited)');

    // Create sample regular user
    console.log('👤 Creating sample user...');
    const userPassword = await bcrypt.hash('password123', 10);
    
    const sampleUser = await prisma.user.create({
      data: {
        username: 'user1',
        password: userPassword,
        role: 'user',
        maxDevices: 3, // Regular user limit
      },
    });

    console.log('✅ Sample user created:', sampleUser.username);
    console.log('📋 Sample user credentials:');
    console.log('   Username: user1');
    console.log('   Password: password123');
    console.log('   Role: user');
    console.log('   Max Devices: 3');

    // Count final records
    const userCount = await prisma.user.count();
    const deviceCount = await prisma.device.count();
    const videoCount = await prisma.video.count();

    console.log('📊 Database summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Devices: ${deviceCount}`);
    console.log(`   Videos: ${videoCount}`);

    console.log('✅ Database reset completed successfully!');

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('🎉 Reset complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Reset failed:', error);
    process.exit(1);
  });
