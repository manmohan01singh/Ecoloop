import bcrypt from 'bcryptjs';
import { User, Provider } from './src/models/index.js';

const createTestUsers = async () => {
  try {
    // Create Moderator
    try {
      const moderatorPassword = await bcrypt.hash('moderator123', 10);
      const moderator = await User.create({
        name: 'Moderator User',
        email: 'moderator@ecoloop.com',
        password: moderatorPassword,
        role: 'moderator',
        ecoKarmaTotal: 0,
        verificationStatus: 'admin_verified',
        subscriptionTier: 'free',
        city: 'Jakarta',
        state: 'DKI Jakarta'
      });
      console.log('✅ Moderator created:', moderator.email);
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        console.log('⚠️  Moderator already exists: moderator@ecoloop.com');
      } else {
        throw e;
      }
    }

    // Create Recycler
    try {
      const recyclerPassword = await bcrypt.hash('recycler123', 10);
      const recycler = await User.create({
        name: 'EcoRecycle Center',
        email: 'recycler@ecoloop.com',
        password: recyclerPassword,
        phone: '+6281234567890',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        role: 'recycler',
        ecoKarmaTotal: 0,
        verificationStatus: 'admin_verified',
        subscriptionTier: 'free',
      });

      // Create provider profile
      await Provider.create({
        userId: recycler.id,
        businessName: 'EcoRecycle Center Jakarta',
        type: 'recycler',
        specializations: ['elektronik', 'plastik', 'logam', 'baterai'],
        description: 'Professional e-waste recycling center in Jakarta',
        address: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        lat: -6.2088,
        lng: 106.8456,
        phone: '+6281234567890',
        whatsapp: '+6281234567890',
        serviceRadius: 50,
        completedJobs: 0,
        verificationStatus: 'admin_verified',
        acceptedMaterials: ['smartphone', 'laptop', 'tablet', 'printer', 'tv', 'baterai', 'kabel', 'plastik', 'logam']
      });

      console.log('✅ Recycler created:', recycler.email);
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        console.log('⚠️  Recycler already exists: recycler@ecoloop.com');
      } else {
        throw e;
      }
    }

    console.log('\n📋 Login Credentials:');
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

createTestUsers();
