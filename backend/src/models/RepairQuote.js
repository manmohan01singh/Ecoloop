import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RepairQuote = sequelize.define('RepairQuote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  repairRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'RepairRequests', key: 'id' },
  },
  providerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Providers', key: 'id' },
  },
  inspectionFee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  estimatedPriceMin: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  estimatedPriceMax: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  partsAssumptions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estimatedTime: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  warrantyTerms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'withdrawn'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  paranoid: true,
});

export default RepairQuote;
