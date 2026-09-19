import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EcoKarma = sequelize.define('EcoKarma', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  points: { type: DataTypes.INTEGER, allowNull: false },
  reason: {
    type: DataTypes.ENUM(
      'community_contribution', 'item_reuse', 'repair_completed',
      'recycling_deposit', 'event_completed', 'material_exchange',
      'challenge_completed', 'listing_completed', 'report_verified', 'other'
    ),
    allowNull: false,
  },
  description: { type: DataTypes.STRING(300), allowNull: true },
  referenceId: { type: DataTypes.UUID, allowNull: true },
  referenceType: { type: DataTypes.STRING(50), allowNull: true },
}, { timestamps: true });

export default EcoKarma;
