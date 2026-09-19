import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Challenge = sequelize.define('Challenge', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  createdById: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: { type: DataTypes.STRING(100), allowNull: true },
  goalType: { type: DataTypes.ENUM('weight_kg', 'items_count', 'actions_count', 'events_count'), defaultValue: 'items_count' },
  goalValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  currentValue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('upcoming', 'active', 'completed', 'cancelled'), defaultValue: 'upcoming' },
  participantCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  coverImage: { type: DataTypes.STRING(500), allowNull: true },
  isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  ecoKarmaReward: { type: DataTypes.INTEGER, defaultValue: 25 },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Challenge;
