import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WasteDeposit = sequelize.define('WasteDeposit', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  providerId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Providers', key: 'id' } },
  material: { type: DataTypes.STRING(100), allowNull: false },
  weightKg: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  pricePerKg: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  totalValue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  depositDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT, allowNull: true },
  ecoKarmaAwarded: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

export default WasteDeposit;
