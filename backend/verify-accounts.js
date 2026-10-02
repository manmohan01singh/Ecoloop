import sequelize, { User } from './src/models/index.js';
import { connectDB } from './src/config/database.js';

async function verifyAccounts() {
  try {
    await connectDB();

    const users = await User.findAll({
      where: {
        role: ['moderator', 'recycler', 'repair_provider']
      },
      attributes: ['name', 'email', 'role'],
      order: [['role', 'ASC']]
    });

    console.log('\n📋 All Special Role Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(u => {
      const icon = u.role === 'moderator' ? '🛡️' : u.role === 'recycler' ? '♻️' : '🔧';
      console.log(`${icon} ${u.role.padEnd(16)} | ${u.email.padEnd(30)} | ${u.name}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nTotal: ${users.length} accounts\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAccounts();
