import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Provider = sequelize.define('Provider', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  businessName: { type: DataTypes.STRING(200), allowNull: false },
  type: {
    type: DataTypes.ENUM('repair', 'recycler', 'waste_collector', 'waste_bank', 'upcycler', 'other'),
    allowNull: false,
  },
  specializations: { type: DataTypes.JSONB, defaultValue: [] },
  description: { type: DataTypes.TEXT, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  province: { type: DataTypes.STRING(100), allowNull: true },
  lat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  lng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  serviceRadius: { type: DataTypes.INTEGER, defaultValue: 10 }, // km
  phone: { type: DataTypes.STRING(30), allowNull: true },
  whatsapp: { type: DataTypes.STRING(30), allowNull: true },
  email: { type: DataTypes.STRING(200), allowNull: true },
  website: { type: DataTypes.STRING(300), allowNull: true },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'community_verified', 'admin_verified'),
    defaultValue: 'unverified',
  },
  ratingSum: { type: DataTypes.INTEGER, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  completedJobs: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  acceptedMaterials: { type: DataTypes.JSONB, defaultValue: [] },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Provider;
