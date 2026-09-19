import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Post = sequelize.define('Post', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  authorId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  communityId: { type: DataTypes.UUID, allowNull: true, references: { model: 'Communities', key: 'id' } },
  title: { type: DataTypes.STRING(300), allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: true },
  category: {
    type: DataTypes.ENUM(
      'recycling', 'repair', 'reuse', 'ewaste', 'plastic', 'textile',
      'food_organic', 'construction', 'packaging', 'sustainability',
      'waste_problems', 'circular_business', 'general'
    ),
    defaultValue: 'general',
  },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  downvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
  commentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  score: { type: DataTypes.FLOAT, defaultValue: 0 }, // hot ranking score
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  isRemoved: { type: DataTypes.BOOLEAN, defaultValue: false },
  flair: { type: DataTypes.STRING(50), allowNull: true },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Post;
