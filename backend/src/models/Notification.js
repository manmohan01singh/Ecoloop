import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  type: {
    type: DataTypes.ENUM(
      'comment', 'reply', 'upvote', 'listing_request', 'request_accepted',
      'reservation', 'event_reminder', 'challenge_update', 'report_status',
      'verification_status', 'repair_update', 'ecokarma', 'general'
    ),
    allowNull: false,
  },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },
  link: { type: DataTypes.STRING(300), allowNull: true },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, { timestamps: true });

export default Notification;
