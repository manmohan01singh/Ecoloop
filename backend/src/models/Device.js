import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'smartphone', 'laptop', 'tablet', 'tv', 'refrigerator',
      'washing_machine', 'ac', 'computer', 'printer', 'other'
    ),
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expectedLifeYears: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'good',
  },
  status: {
    type: DataTypes.ENUM('active', 'listed', 'sold', 'recycled', 'disposed'),
    defaultValue: 'active',
  },
  usageHoursPerDay: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 4.0,
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Device;
