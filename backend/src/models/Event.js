import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  createdById: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  communityId: { type: DataTypes.UUID, allowNull: true, references: { model: 'Communities', key: 'id' } },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  type: {
    type: DataTypes.ENUM('cleanup', 'repair_workshop', 'collection_drive', 'swap_event', 'donation_drive', 'upcycling_workshop', 'other'),
    defaultValue: 'other',
  },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  lat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  lng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: true },
  capacity: { type: DataTypes.INTEGER, allowNull: true },
  participantCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'), defaultValue: 'upcoming' },
  goalDescription: { type: DataTypes.STRING(300), allowNull: true },
  coverImage: { type: DataTypes.STRING(500), allowNull: true },
  // Post-event results
  resultParticipants: { type: DataTypes.INTEGER, allowNull: true },
  resultMaterialKg: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  resultItemsRepaired: { type: DataTypes.INTEGER, allowNull: true },
  resultItemsReused: { type: DataTypes.INTEGER, allowNull: true },
  resultsVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  ecoKarmaReward: { type: DataTypes.INTEGER, defaultValue: 25 },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Event;
