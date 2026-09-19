import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Listing = sequelize.define('Listing', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: {
    type: DataTypes.ENUM(
      'electronics', 'plastic', 'metal', 'paper_cardboard', 'glass',
      'textile', 'furniture', 'appliances', 'organic', 'construction', 'other'
    ),
    allowNull: false,
  },
  material: { type: DataTypes.STRING(100), allowNull: true },
  condition: { type: DataTypes.ENUM('like_new', 'good', 'fair', 'poor', 'for_parts'), defaultValue: 'good' },
  quantity: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
  unit: { type: DataTypes.STRING(20), defaultValue: 'pcs' },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  city: { type: DataTypes.STRING(100), allowNull: true },
  province: { type: DataTypes.STRING(100), allowNull: true },
  pickupType: { type: DataTypes.ENUM('pickup', 'dropoff', 'both', 'shipping'), defaultValue: 'both' },
  price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  isFree: { type: DataTypes.BOOLEAN, defaultValue: true },
  availableUntil: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'completed', 'expired', 'cancelled'),
    defaultValue: 'available',
  },
  circularAction: {
    type: DataTypes.ENUM('give_away', 'sell', 'donate', 'repair', 'reuse', 'recycle', 'parts'),
    allowNull: false,
  },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  contactMethod: { type: DataTypes.STRING(100), allowNull: true },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Listing;
