import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BusinessMaterial = sequelize.define('BusinessMaterial', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  companyName: { type: DataTypes.STRING(200), allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  materialType: {
    type: DataTypes.ENUM(
      'cardboard', 'plastic', 'wood', 'textile', 'packaging',
      'construction', 'electronics', 'industrial', 'metal', 'other'
    ),
    allowNull: false,
  },
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  unit: { type: DataTypes.STRING(30), defaultValue: 'kg' },
  frequency: { type: DataTypes.ENUM('one_time', 'weekly', 'monthly', 'ongoing'), defaultValue: 'one_time' },
  city: { type: DataTypes.STRING(100), allowNull: true },
  province: { type: DataTypes.STRING(100), allowNull: true },
  price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  isFree: { type: DataTypes.BOOLEAN, defaultValue: false },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  contactEmail: { type: DataTypes.STRING(200), allowNull: true },
  contactPhone: { type: DataTypes.STRING(30), allowNull: true },
  status: {
    type: DataTypes.ENUM('listed', 'requested', 'accepted', 'completed', 'cancelled'),
    defaultValue: 'listed',
  },
  requestCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default BusinessMaterial;
