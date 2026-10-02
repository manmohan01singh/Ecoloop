import sequelize from './src/models/index.js';
import { User, Challenge, Event, ChallengeParticipant, EventParticipant } from './src/models/index.js';

async function seedOrganizationData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get the organization user
    const orgUser = await User.findOne({ where: { email: 'organization@ecoloop.com' } });
    
    if (!orgUser) {
      console.log('❌ Organization user not found!');
      process.exit(1);
    }

    console.log('📋 Creating Challenges...\n');

    // Create Challenges
    const challenges = [
      {
        title: '30-Day Plastic-Free Challenge',
        description: 'Join us in reducing single-use plastic consumption for 30 days. Track your progress and inspire others to make sustainable choices.',
        category: 'plastic',
        goalType: 'actions_count',
        goalValue: 500,
        currentValue: 0,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-31'),
        status: 'active',
        ecoKarmaReward: 100,
        createdById: orgUser.id
      },
      {
        title: 'E-Waste Collection Drive',
        description: 'Help us collect 200 electronic devices for proper recycling. Every device counts towards a cleaner environment!',
        category: 'ewaste',
        goalType: 'items_count',
        goalValue: 200,
        currentValue: 45,
        startDate: new Date('2026-10-05'),
        endDate: new Date('2026-11-05'),
        status: 'active',
        ecoKarmaReward: 150,
        createdById: orgUser.id
      },
      {
        title: 'Zero Waste Week',
        description: 'Challenge yourself to produce zero waste for an entire week. Learn sustainable practices and win exciting rewards!',
        category: 'sustainability',
        goalType: 'actions_count',
        goalValue: 100,
        currentValue: 23,
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-22'),
        status: 'upcoming',
        ecoKarmaReward: 200,
        createdById: orgUser.id
      },
      {
        title: 'Community Recycling Marathon',
        description: 'Compete with other communities to recycle the most waste. Top 3 communities win prizes!',
        category: 'recycling',
        goalType: 'weight_kg',
        goalValue: 1000,
        currentValue: 456,
        startDate: new Date('2026-09-15'),
        endDate: new Date('2026-09-30'),
        status: 'completed',
        ecoKarmaReward: 250,
        createdById: orgUser.id
      },
      {
        title: 'Green Events Attendance',
        description: 'Attend 5 environmental events this month and earn your Green Warrior badge!',
        category: 'awareness',
        goalType: 'events_count',
        goalValue: 5,
        currentValue: 2,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-31'),
        status: 'active',
        ecoKarmaReward: 80,
        createdById: orgUser.id
      }
    ];

    for (const challengeData of challenges) {
      const challenge = await Challenge.create(challengeData);
      console.log(`✅ Created challenge: ${challenge.title}`);
    }

    console.log('\n📅 Creating Events...\n');

    // Create Events
    const events = [
      {
        title: 'Community Tree Planting Day',
        description: 'Join us for a morning of tree planting at Central Park. We aim to plant 100 trees to combat climate change. Refreshments provided!',
        type: 'other',
        startDate: new Date('2026-10-15T09:00:00'),
        endDate: new Date('2026-10-15T13:00:00'),
        address: 'Central Park, Main Entrance',
        city: 'Mumbai',
        capacity: 50,
        status: 'upcoming',
        goalDescription: 'Plant 100 trees to combat climate change',
        ecoKarmaReward: 50,
        createdById: orgUser.id
      },
      {
        title: 'Beach Cleanup Drive',
        description: 'Help us clean Juhu Beach and make it plastic-free! All cleaning equipment will be provided. Let\'s protect our marine life together.',
        type: 'cleanup',
        startDate: new Date('2026-10-20T07:00:00'),
        endDate: new Date('2026-10-20T11:00:00'),
        address: 'Juhu Beach, North Section',
        city: 'Mumbai',
        capacity: 100,
        status: 'upcoming',
        goalDescription: 'Collect 500kg of beach waste',
        ecoKarmaReward: 40,
        createdById: orgUser.id
      },
      {
        title: 'Sustainability Workshop: Zero Waste Living',
        description: 'Learn practical tips to reduce waste in your daily life. Interactive workshop covering composting, recycling, and sustainable shopping.',
        type: 'other',
        startDate: new Date('2026-10-25T18:00:00'),
        endDate: new Date('2026-10-25T20:00:00'),
        address: 'Green Hub Community Center, Bandra',
        city: 'Mumbai',
        capacity: 30,
        status: 'upcoming',
        goalDescription: 'Learn zero waste practices',
        ecoKarmaReward: 30,
        createdById: orgUser.id
      },
      {
        title: 'E-Waste Collection & Awareness Camp',
        description: 'Bring your old electronics for safe recycling. Free e-waste collection, tech demos, and learn about proper e-waste disposal.',
        type: 'collection_drive',
        startDate: new Date('2026-10-28T10:00:00'),
        endDate: new Date('2026-10-28T16:00:00'),
        address: 'Phoenix Mall, Lower Parel',
        city: 'Mumbai',
        capacity: 200,
        status: 'upcoming',
        goalDescription: 'Collect 300 electronic items for recycling',
        ecoKarmaReward: 60,
        createdById: orgUser.id
      },
      {
        title: 'Green Marathon 2026',
        description: '5K run to raise awareness about climate change. All proceeds go to environmental conservation. Run for the planet!',
        type: 'other',
        startDate: new Date('2026-11-05T06:00:00'),
        endDate: new Date('2026-11-05T10:00:00'),
        address: 'Marine Drive to Gateway of India',
        city: 'Mumbai',
        capacity: 500,
        status: 'upcoming',
        goalDescription: 'Raise awareness about climate change',
        ecoKarmaReward: 75,
        createdById: orgUser.id
      },
      {
        title: 'Urban Gardening Workshop',
        description: 'Learn how to grow your own vegetables in small urban spaces. Perfect for apartment dwellers and balcony gardeners.',
        type: 'other',
        startDate: new Date('2026-11-10T16:00:00'),
        endDate: new Date('2026-11-10T18:30:00'),
        address: 'EcoSpace, Andheri West',
        city: 'Mumbai',
        capacity: 25,
        status: 'upcoming',
        goalDescription: 'Learn urban gardening techniques',
        ecoKarmaReward: 35,
        createdById: orgUser.id
      },
      {
        title: 'Repair Workshop: Fix Your Electronics',
        description: 'Bring your broken electronics and learn how to repair them! Expert technicians will guide you. Save money and reduce e-waste.',
        type: 'repair_workshop',
        startDate: new Date('2026-11-12T14:00:00'),
        endDate: new Date('2026-11-12T18:00:00'),
        address: 'Tech Hub, Powai',
        city: 'Mumbai',
        capacity: 40,
        status: 'upcoming',
        goalDescription: 'Repair 50 electronic items',
        ecoKarmaReward: 45,
        createdById: orgUser.id
      },
      {
        title: 'Clothing Swap Event',
        description: 'Bring clothes you don\'t wear and swap them for something new! Reduce textile waste and refresh your wardrobe for free.',
        type: 'swap_event',
        startDate: new Date('2026-11-15T11:00:00'),
        endDate: new Date('2026-11-15T17:00:00'),
        address: 'Community Center, Bandra',
        city: 'Mumbai',
        capacity: 80,
        status: 'upcoming',
        goalDescription: 'Swap 200+ clothing items',
        ecoKarmaReward: 40,
        createdById: orgUser.id
      },
      {
        title: 'World Environment Day Celebration',
        description: 'A day-long celebration with tree planting, workshops, eco-games, and guest speakers. Fun for the whole family!',
        type: 'other',
        startDate: new Date('2026-09-05T10:00:00'),
        endDate: new Date('2026-09-05T18:00:00'),
        address: 'Sanjay Gandhi National Park',
        city: 'Mumbai',
        capacity: 300,
        status: 'completed',
        goalDescription: 'Celebrate environmental awareness',
        resultParticipants: 280,
        resultMaterialKg: 85,
        resultsVerified: true,
        ecoKarmaReward: 100,
        createdById: orgUser.id
      },
      {
        title: 'Monsoon Tree Plantation Drive',
        description: 'Best time to plant trees! Join us in making Mumbai greener. Expert guidance on tree care provided.',
        type: 'other',
        startDate: new Date('2026-09-20T08:00:00'),
        endDate: new Date('2026-09-20T12:00:00'),
        address: 'Aarey Colony',
        city: 'Mumbai',
        capacity: 75,
        status: 'completed',
        goalDescription: 'Plant 125 trees',
        resultParticipants: 68,
        resultsVerified: true,
        ecoKarmaReward: 80,
        createdById: orgUser.id
      }
    ];

    for (const eventData of events) {
      const event = await Event.create(eventData);
      console.log(`✅ Created event: ${event.title} (${event.status})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ORGANIZATION DATA SEEDED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Summary:');
    console.log(`  Challenges Created: ${challenges.length}`);
    console.log(`  Events Created: ${events.length}`);
    console.log(`  Active Challenges: ${challenges.filter(c => c.status === 'active').length}`);
    console.log(`  Upcoming Events: ${events.filter(e => e.status === 'upcoming').length}`);
    console.log(`  Completed Events: ${events.filter(e => e.status === 'completed').length}`);
    console.log('');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedOrganizationData();
