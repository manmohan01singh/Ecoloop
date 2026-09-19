import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EventParticipant = sequelize.define('EventParticipant', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  eventId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Events', key: 'id' } },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  status: { type: DataTypes.ENUM('joined', 'attended', 'cancelled'), defaultValue: 'joined' },
  ecoKarmaAwarded: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['eventId', 'userId'] }],
});

export default EventParticipant;
