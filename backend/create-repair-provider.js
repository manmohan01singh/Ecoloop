import sequelize, { User, Provider } from './src/models/index.js';
import { connectDB } from './src/config/database.js';

async function createRepairProvider() {
  try {
    await connectDB();

    // Check if repair provider already exists
    let user = await User.findOne({ where: { email: 'repair@ecoloop.com' } });

    if (user) {
      console.log('✅ Repair provider account already exists');
    } else {
      // Create repair provider user
      user = await User.create({
        name: 'TechFix Repair Center',
        email: 'repair@ecoloop.com',
        password: 'repair123', // Will be hashed by User model hook
        phone: '+6281234567899',
        address: '456 Tech Street',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        pincode: '12345',
        role: 'repair_provider',
        ecoKarmaTotal: 0,
        bio: 'Professional electronics repair service with 10+ years of experience',
        verificationStatus: 'admin_verified',
        subscriptionTier: 'premium',
      });
      console.log('✅ Repair provider user created');
    }

    // Create Provider profile for repair services
    let provider = await Provider.findOne({ where: { userId: user.id } });

    if (!provider) {
      provider = await Provider.create({
        userId: user.id,
        businessName: 'TechFix Repair Center',
        type: 'repair',
        specializations: [
          'Smartphone Repair',
          'Laptop Repair',
          'Tablet Repair',
          'Computer Repair',
          'Home Appliance Repair',
          'Data Recovery',
          'Screen Replacement',
          'Battery Replacement'
        ],
        description: 'Expert repair services for all types of electronic devices. We specialize in smartphones, laptops, tablets, and home appliances with 10+ years of experience.',
        address: '456 Tech Street, Central Business District',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        lat: -6.2088,
        lng: 106.8456,
        serviceRadius: 15,
        phone: '+6281234567899',
        whatsapp: '+6281234567899',
        email: 'repair@ecoloop.com',
        website: 'https://techfix.example.com',
        verificationStatus: 'admin_verified',
        ratingSum: 748,
        ratingCount: 156,
        completedJobs: 142,
        isActive: true,
        acceptedMaterials: [
          'smartphones',
          'laptops',
          'tablets',
          'computers',
          'printers',
          'monitors',
          'tv',
          'refrigerator',
          'washing_machine',
          'ac'
        ],
      });
      console.log('✅ Provider profile created');
    } else {
      console.log('✅ Provider profile already exists');
    }

    console.log('\n📋 Repair Provider Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    repair@ecoloop.com');
    console.log('Password: repair123');
    console.log('Role:     repair_provider');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createRepairProvider();
