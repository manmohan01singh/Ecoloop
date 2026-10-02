import { User } from './src/models/index.js';
import bcrypt from 'bcryptjs';
import sequelize from './src/config/database.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Find organization user
    const org = await User.findOne({ where: { email: 'organization@ecoloop.com' } });
    
    if (!org) {
      console.log('❌ Organization account NOT FOUND!');
      process.exit(1);
    }

    console.log('✅ Organization Account Found:');
    console.log('  Email:', org.email);
    console.log('  Name:', org.name);
    console.log('  Role:', org.role);
    console.log('  ID:', org.id);
    console.log('  City:', org.city);
    console.log('');

    // Test password
    const testPassword = 'organization123';
    const isMatch = await bcrypt.compare(testPassword, org.password);
    
    console.log('🔐 Password Test:');
    console.log('  Testing password:', testPassword);
    console.log('  Password Match:', isMatch ? '✅ YES' : '❌ NO');
    console.log('');

    if (!isMatch) {
      console.log('⚠️  Password mismatch detected. Resetting password...');
      org.password = await bcrypt.hash(testPassword, 10);
      await org.save();
      console.log('✅ Password reset successful!');
      console.log('');
      
      // Test again
      const newMatch = await bcrypt.compare(testPassword, org.password);
      console.log('🔐 Verification after reset:', newMatch ? '✅ Password works!' : '❌ Still not working');
    }

    console.log('\n📋 Summary:');
    console.log('  Account exists: ✅');
    console.log('  Email: organization@ecoloop.com');
    console.log('  Password: organization123');
    console.log('  Role: organization');
    console.log('  Should redirect to: /organization');
    console.log('\n✅ Organization login should work now!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
