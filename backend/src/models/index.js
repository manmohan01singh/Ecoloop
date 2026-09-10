import sequelize from '../config/database.js';
import User from './User.js';
import Device from './Device.js';

// Associations
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Device };
export default sequelize;
