import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RepairMessage = sequelize.define('RepairMessage', {
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
    allowNull: true,
    references: { model: 'Providers', key: 'id' },
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default RepairMessage;
