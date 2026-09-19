import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MaterialRequest = sequelize.define('MaterialRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  materialId: { type: DataTypes.UUID, allowNull: false, references: { model: 'BusinessMaterials', key: 'id' } },
  requesterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  message: { type: DataTypes.TEXT, allowNull: true },
  quantityNeeded: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

export default MaterialRequest;
