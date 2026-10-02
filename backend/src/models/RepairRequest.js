import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RepairRequest = sequelize.define('RepairRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  providerId: { type: DataTypes.UUID, allowNull: true, references: { model: 'Providers', key: 'id' } },
  itemName: { type: DataTypes.STRING(255), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  city: { type: DataTypes.STRING(100), allowNull: true },
  status: {
    type: DataTypes.ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'requested',
  },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  estimatedCost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  estimatedTime: { type: DataTypes.STRING(100), allowNull: true },
  estimatedCompletion: { type: DataTypes.DATE, allowNull: true },
  requiredParts: { type: DataTypes.JSONB, defaultValue: [] },
  beforePhotos: { type: DataTypes.JSONB, defaultValue: [] },
  afterPhotos: { type: DataTypes.JSONB, defaultValue: [] },
  partsReplaced: { type: DataTypes.JSONB, defaultValue: [] },
  eWasteRecorded: { type: DataTypes.BOOLEAN, defaultValue: false },
  eWasteDepositId: { type: DataTypes.UUID, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  userConfirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
  ecoKarmaAwarded: { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default RepairRequest;
