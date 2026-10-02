import { User, Provider } from './src/models/index.js';
import bcrypt from 'bcryptjs';

const accounts = [
  {
    role: 'admin',
    email: 'admin@ecoloop.com',
    password: 'admin123',
    name: 'Admin User',
    phone: '+6281234567890'
  },
  {
    role: 'moderator',
    email: 'moderator@ecoloop.com',
    password: 'moderator123',
    name: 'Moderator User',
    phone: '+6281234567891'
  },
  {
    role: 'recycler',
    email: 'recycler@ecoloop.com',
    password: 'recycler123',
    name: 'EcoRecycle Center',
    phone: '+6281234567892',
    createProvider: true,
    providerData: {
      businessName: 'EcoRecycle Center',
      type: 'recycling_center',
      address: 'Jl. Daur Ulang No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      phone: '+6281234567892',
      email: 'recycler@ecoloop.com',
      acceptedMaterials: ['Plastic', 'Paper', 'Metal', 'Glass', 'Electronics'],
      operatingHours: 'Mon-Sat: 8AM-5PM',
      verificationStatus: 'admin_verified'
    }
  },
  {
    role: 'repair_provider',
    email: 'repair@ecoloop.com',
    password: 'repair123',
    name: 'TechFix',
    phone: '+6281234567893',
    createProvider: true,
    providerData: {
      businessName: 'TechFix Repair Center',
      type: 'repair_service',
      address: 'Jl. Reparasi No. 456',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      phone: '+6281234567893',
      email: 'repair@ecoloop.com',
      specializations: ['Smartphone Repair', 'Laptop Repair', 'Tablet Repair'],
      acceptedMaterials: ['Smartphones', 'Laptops', 'Tablets'],
      operatingHours: 'Mon-Fri: 9AM-6PM',
      verificationStatus: 'admin_verified'
    }
  },
  {
    role: 'business',
    email: 'business@ecoloop.com',
    password: 'business123',
    name: 'GreenTech Industries',
    phone: '+6281234567894'
  },
  {
    role: 'organization',
    email: 'organization@ecoloop.com',
    password: 'organization123',
    name: 'Green Future NGO',
    phone: '+6281234567895'
  }
];

async function createAccounts() {
  console.log('\n🔧 Creating/Updating All Role Accounts...\n');

  for (const account of accounts) {
    try {
      // Check if user exists
      let user = await User.findOne({ where: { email: account.email } });
      
      if (user) {
        console.log(`✓ User exists: ${account.email} (${account.role})`);
        
        // Update password
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await user.update({
          password: hashedPassword,
          role: account.role,
          name: account.name,
          phone: account.phone,
          isVerified: true
        });
        console.log(`  ✓ Password reset and verified`);
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(account.password, 10);
        user = await User.create({
          email: account.email,
          password: hashedPassword,
          name: account.name,
          role: account.role,
          phone: account.phone,
          city: 'Jakarta',
          isVerified: true,
          ecoKarmaTotal: 100
        });
        console.log(`✓ Created new user: ${account.email} (${account.role})`);
      }

      // Create provider profile if needed
      if (account.createProvider) {
        let provider = await Provider.findOne({ where: { userId: user.id } });
        
        if (!provider) {
          provider = await Provider.create({
            userId: user.id,
            ...account.providerData
          });
          console.log(`  ✓ Created provider profile: ${account.providerData.businessName}`);
        } else {
          console.log(`  ✓ Provider profile exists`);
        }
      }

      console.log('');
    } catch (error) {
      console.error(`✗ Error creating ${account.email}:`, error.message);
    }
  }

  console.log('\n=== ALL ACCOUNTS ===\n');
  
  for (const account of accounts) {
    console.log(`${account.role.toUpperCase()}:`);
    console.log(`  Email:    ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log(`  URL:      http://localhost:5174/${account.role === 'admin' ? 'admin' : account.role === 'business' ? 'business-dashboard' : account.role === 'repair_provider' ? 'repair-provider' : account.role}`);
    console.log('');
  }

  console.log('✅ All accounts ready!\n');
  process.exit(0);
}

createAccounts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
