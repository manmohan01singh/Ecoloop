import { User } from './src/models/index.js';

async function checkUsers() {
  try {
    const users = await User.findAll({
      attributes: ['email', 'role', 'name'],
      order: [['role', 'ASC'], ['email', 'ASC']]
    });

    console.log('\n=== ALL USERS IN DATABASE ===\n');
    
    const roleGroups = {};
    users.forEach(u => {
      if (!roleGroups[u.role]) roleGroups[u.role] = [];
      roleGroups[u.role].push(u);
    });

    Object.keys(roleGroups).sort().forEach(role => {
      console.log(`\n${role.toUpperCase()} USERS:`);
      roleGroups[role].forEach(u => {
        console.log(`  Email: ${u.email}`);
        console.log(`  Name:  ${u.name}`);
        console.log('  ---');
      });
    });

    console.log(`\nTotal users: ${users.length}\n`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
