import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Location = sequelize.define('Location', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  category: {
    type: DataTypes.ENUM(
      'recycling_center', 'waste_bank', 'collector', 'repair_shop',
      'collection_point', 'community_hub', 'donation_center', 'other'
    ),
    allowNull: false,
  },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  province: { type: DataTypes.STRING(100), allowNull: true },
  lat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  lng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  openingHours: { type: DataTypes.JSONB, allowNull: true },
  acceptedMaterials: { type: DataTypes.JSONB, defaultValue: [] },
  contact: { type: DataTypes.JSONB, allowNull: true },
  website: { type: DataTypes.STRING(300), allowNull: true },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'community_verified', 'admin_verified'),
    defaultValue: 'unverified',
  },
  isDemo: { type: DataTypes.BOOLEAN, defaultValue: false },
  submittedById: { type: DataTypes.UUID, allowNull: true, references: { model: 'Users', key: 'id' } },
  verifiedById: { type: DataTypes.UUID, allowNull: true, references: { model: 'Users', key: 'id' } },
  ratingSum: { type: DataTypes.INTEGER, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Location;
