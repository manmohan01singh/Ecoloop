import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';

const resetPasswords = async () => {
  try {
    // Update Moderator password
    const moderatorPassword = await bcrypt.hash('moderator123', 10);
    await User.update(
      { password: moderatorPassword },
      { where: { email: 'moderator@ecoloop.com' }, individualHooks: false }
    );
    console.log('✅ Moderator password reset');

    // Update Recycler password
    const recyclerPassword = await bcrypt.hash('recycler123', 10);
    await User.update(
      { password: recyclerPassword },
      { where: { email: 'recycler@ecoloop.com' }, individualHooks: false }
    );
    console.log('✅ Recycler password reset');

    console.log('\n📋 Updated Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Moderator:');
    console.log('  Email: moderator@ecoloop.com');
    console.log('  Password: moderator123');
    console.log('\nRecycler:');
    console.log('  Email: recycler@ecoloop.com');
    console.log('  Password: recycler123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetPasswords();
