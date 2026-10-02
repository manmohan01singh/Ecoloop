import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WasteDeposit = sequelize.define('WasteDeposit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  providerId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Providers', key: 'id' } },
  deviceType: { type: DataTypes.STRING(100), allowNull: true },
  material: { type: DataTypes.STRING(100), allowNull: true },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  weight: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
  weightKg: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
  condition: { type: DataTypes.STRING(50), allowNull: true },
  verificationStatus: { type: DataTypes.STRING(50), defaultValue: 'pending' },
  ecoKarmaEarned: { type: DataTypes.INTEGER, defaultValue: 0 },
  items: { type: DataTypes.JSONB, defaultValue: [] },
  pricePerKg: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalValue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  depositDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT, allowNull: true },
  source: { type: DataTypes.STRING(50), defaultValue: 'direct' },
  ecoKarmaAwarded: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

export default WasteDeposit;
