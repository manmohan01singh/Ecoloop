import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';
import { User, Device } from './models/index.js';
import logger from './utils/logger.js';

const seedData = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to database for seeding');

    // Sync tables
    await sequelize.sync({ force: true });
    logger.info('Tables dropped and recreated');

    // Create demo users
    const users = await User.bulkCreate([
      {
        name: 'Demo User',
        email: 'demo@ecoloop.com',
        phone: '+919876543210',
        password: await bcrypt.hash('demo123', 10),
        address: '123 Green Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        role: 'user',
      },
      {
        name: 'Admin User',
        email: 'admin@ecoloop.com',
        phone: '+919876543211',
        password: await bcrypt.hash('admin123', 10),
        address: '456 Eco Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        role: 'admin',
      },
      {
        name: 'Green Recyclers',
        email: 'recycler@ecoloop.com',
        phone: '+919876543212',
        password: await bcrypt.hash('recycler123', 10),
        address: '789 Recycle Hub',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        role: 'recycler',
      },
    ]);

    logger.info(`Created ${users.length} demo users`);

    // Create demo devices for Demo User
    const devices = await Device.bulkCreate([
      {
        userId: users[0].id,
        name: 'iPhone 12',
        category: 'smartphone',
        brand: 'Apple',
        model: 'iPhone 12 128GB',
        purchaseDate: '2021-03-15',
        condition: 'good',
        status: 'active',
        usageHoursPerDay: 6.0,
        location: { city: 'Delhi', pincode: '110001' },
        metadata: { color: 'Blue', storage: '128GB' },
      },
      {
        userId: users[0].id,
        name: 'MacBook Pro 2019',
        category: 'laptop',
        brand: 'Apple',
        model: 'MacBook Pro 13-inch',
        purchaseDate: '2019-06-01',
        condition: 'fair',
        status: 'active',
        usageHoursPerDay: 8.0,
        location: { city: 'Delhi', pincode: '110001' },
        metadata: { color: 'Space Gray', ram: '16GB', storage: '512GB' },
      },
      {
        userId: users[0].id,
        name: 'Samsung Galaxy S21',
        category: 'smartphone',
        brand: 'Samsung',
        model: 'Galaxy S21 FE',
        purchaseDate: '2022-01-10',
        condition: 'excellent',
        status: 'active',
        usageHoursPerDay: 5.0,
        location: { city: 'Delhi', pincode: '110001' },
        metadata: { color: 'Lavender', storage: '256GB' },
      },
      {
        userId: users[0].id,
        name: 'LG Smart TV',
        category: 'tv',
        brand: 'LG',
        model: '55 inch OLED',
        purchaseDate: '2018-11-20',
        condition: 'good',
        status: 'active',
        usageHoursPerDay: 4.0,
        location: { city: 'Delhi', pincode: '110001' },
        metadata: { size: '55 inch', type: 'OLED' },
      },
      {
        userId: users[0].id,
        name: 'Dell Printer',
        category: 'printer',
        brand: 'Dell',
        model: 'LaserJet Pro',
        purchaseDate: '2020-07-05',
        condition: 'poor',
        status: 'active',
        usageHoursPerDay: 1.0,
        location: { city: 'Delhi', pincode: '110001' },
        metadata: { type: 'Laser', color: 'Monochrome' },
      },
    ]);

    logger.info(`Created ${devices.length} demo devices`);

    // Summary
    logger.info('========================================');
    logger.info('  SEEDING COMPLETE!');
    logger.info('========================================');
    logger.info('');
    logger.info('Demo Accounts:');
    logger.info('  User:     demo@ecoloop.com / demo123');
    logger.info('  Admin:    admin@ecoloop.com / admin123');
    logger.info('  Recycler: recycler@ecoloop.com / recycler123');
    logger.info('');
    logger.info(`Demo devices: ${devices.length} (for demo@ecoloop.com)`);
    logger.info('========================================');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
