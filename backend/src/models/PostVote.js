import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostVote = sequelize.define('PostVote', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Posts', key: 'id' } },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  value: { type: DataTypes.INTEGER, allowNull: false, validate: { isIn: [[1, -1]] } },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['postId', 'userId'] }],
});

export default PostVote;
