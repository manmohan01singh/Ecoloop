import bcrypt from 'bcryptjs';
import { User, Provider } from './src/models/index.js';

const createRecycler = async () => {
  try {
    const password = await bcrypt.hash('recycler123', 10);
    
    const recycler = await User.create({
      name: 'EcoRecycle Center',
      email: 'recycler@ecoloop.com',
      password,
      phone: '+6281234567890',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      role: 'recycler',
      ecoKarmaTotal: 0,
      verificationStatus: 'admin_verified',
      subscriptionTier: 'free',
    });

    // Create provider profile for the recycler
    await Provider.create({
      userId: recycler.id,
      businessName: 'EcoRecycle Center Jakarta',
      type: 'recycler',
      specializations: ['elektronik', 'plastik', 'logam', 'baterai'],
      description: 'Professional e-waste recycling center in Jakarta. We accept all types of electronic waste.',
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
      acceptedMaterials: ['smartphone', 'laptop', 'tablet', 'printer', 'tv', 'ac', 'kulkas', 'baterai', 'kabel', 'plastik', 'logam']
    });

    console.log('✅ Recycler user created successfully!');
    console.log('Email: recycler@ecoloop.com');
    console.log('Password: recycler123');
    console.log('Role: recycler');
    console.log('User ID:', recycler.id);
    
    process.exit(0);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('⚠️  Recycler user already exists!');
      console.log('Email: recycler@ecoloop.com');
      console.log('Password: recycler123');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
};

createRecycler();
