import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';

const createModerator = async () => {
  try {
    const password = await bcrypt.hash('moderator123', 10);
    
    const moderator = await User.create({
      name: 'Moderator User',
      email: 'moderator@ecoloop.com',
      password,
      role: 'moderator',
      ecoKarmaTotal: 0,
      verificationStatus: 'admin_verified',
      subscriptionTier: 'free',
    });

    console.log('✅ Moderator user created successfully!');
    console.log('Email: moderator@ecoloop.com');
    console.log('Password: moderator123');
    console.log('Role: moderator');
    console.log('User ID:', moderator.id);
    
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('⚠️  Moderator user already exists!');
      console.log('Email: moderator@ecoloop.com');
      console.log('Password: moderator123');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
};

createModerator();
