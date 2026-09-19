import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CommunityMember = sequelize.define('CommunityMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  communityId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Communities', key: 'id' } },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  role: { type: DataTypes.ENUM('member', 'moderator', 'admin'), defaultValue: 'member' },
  joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['communityId', 'userId'] }],
});

export default CommunityMember;
