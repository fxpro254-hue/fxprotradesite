const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser(loginId) {
  try {
    const user = await prisma.user.findUnique({
      where: { loginId }
    });

    if (user) {
      // Delete user (messages will cascade delete)
      await prisma.user.delete({
        where: { loginId }
      });
      console.log('✅ User deleted:', loginId);
      console.log('   - Name:', user.fullName);
      console.log('   - Created:', user.createdAt);
    } else {
      console.log('❌ User not found:', loginId);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    await prisma.$disconnect();
  }
}

const loginId = process.argv[2];

if (!loginId) {
  console.error('Usage: node delete-user.js <loginId>');
  console.error('Example: node delete-user.js CR5942579');
  process.exit(1);
}

console.log('🗑️ Deleting user:', loginId);
console.log('='.repeat(60));
deleteUser(loginId);
