import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Posts', key: 'id' } },
  authorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  parentId: { type: DataTypes.UUID, allowNull: true, references: { model: 'Comments', key: 'id' } },
  body: { type: DataTypes.TEXT, allowNull: false },
  upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  downvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  isRemoved: { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Comment;
