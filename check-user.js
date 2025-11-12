const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser(loginId) {
  try {
    const user = await prisma.user.findUnique({
      where: { loginId }
    });

    if (user) {
      console.log('✅ User found in database:');
      console.log('   - Login ID:', user.loginId);
      console.log('   - Full Name:', user.fullName);
      console.log('   - Created:', user.createdAt);
      console.log('   - Avatar:', user.avatar);
      console.log('\n⚠️ This is an EXISTING user - welcome email will NOT be sent during registration');
    } else {
      console.log('❌ User NOT found in database');
      console.log('✅ This is a NEW user - welcome email WILL be sent during registration');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error checking user:', error);
    await prisma.$disconnect();
  }
}

// Get loginId from command line or use default
const loginId = process.argv[2] || 'CR5942579';

console.log('🔍 Checking user:', loginId);
console.log('='.repeat(60));
checkUser(loginId);
