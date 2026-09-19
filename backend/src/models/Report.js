import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Report = sequelize.define('Report', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  reporterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.ENUM('illegal_dumping', 'overflowing_waste', 'uncollected_waste', 'hazardous_waste', 'broken_bin', 'other'),
    allowNull: false,
  },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING(100), allowNull: true },
  lat: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  lng: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  status: {
    type: DataTypes.ENUM('reported', 'under_review', 'verified', 'assigned', 'resolved', 'rejected'),
    defaultValue: 'reported',
  },
  upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  adminNote: { type: DataTypes.TEXT, allowNull: true },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Report;
