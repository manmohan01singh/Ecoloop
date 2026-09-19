import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ListingRequest = sequelize.define('ListingRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  listingId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Listings', key: 'id' } },
  requesterId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

export default ListingRequest;
