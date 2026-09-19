import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChallengeParticipant = sequelize.define('ChallengeParticipant', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  challengeId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Challenges', key: 'id' } },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  contribution: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  rank: { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['challengeId', 'userId'] }],
});

export default ChallengeParticipant;
