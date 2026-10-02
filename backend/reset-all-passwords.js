import bcrypt from 'bcryptjs';
import sequelize from './src/models/index.js';
import { User } from './src/models/index.js';

async function resetAllPasswords() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const accounts = [
      { email: 'admin@ecoloop.com', password: 'admin123', role: 'admin' },
      { email: 'moderator@ecoloop.com', password: 'moderator123', role: 'moderator' },
      { email: 'recycler@ecoloop.com', password: 'recycler123', role: 'recycler' },
      { email: 'repair@ecoloop.com', password: 'repair123', role: 'repair_provider' },
      { email: 'business@ecoloop.com', password: 'business123', role: 'business' },
      { email: 'organization@ecoloop.com', password: 'organization123', role: 'organization' }
    ];

    console.log('\n🔄 Resetting all passwords...\n');

    for (const account of accounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      const [updatedCount] = await User.update(
        { password: hashedPassword },
        { where: { email: account.email } }
      );

      if (updatedCount > 0) {
        console.log(`✅ ${account.role.toUpperCase()}: ${account.email} → ${account.password}`);
      } else {
        console.log(`❌ ${account.role.toUpperCase()}: Account not found - ${account.email}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL PASSWORDS RESET SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 LOGIN CREDENTIALS:\n');
    accounts.forEach(acc => {
      console.log(`${acc.role.toUpperCase()}:`);
      console.log(`  Email:    ${acc.email}`);
      console.log(`  Password: ${acc.password}`);
      console.log('');
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAllPasswords();
