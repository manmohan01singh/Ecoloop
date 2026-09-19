import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Community = sequelize.define('Community', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: {
    type: DataTypes.ENUM(
      'recycling', 'repair', 'reuse', 'ewaste', 'plastic', 'textile',
      'food_organic', 'construction', 'packaging', 'sustainability',
      'waste_problems', 'circular_business', 'general'
    ),
    defaultValue: 'general',
  },
  coverImage: { type: DataTypes.STRING(500), allowNull: true },
  icon: { type: DataTypes.STRING(100), allowNull: true },
  isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  postCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  rules: { type: DataTypes.JSONB, defaultValue: [] },
  createdById: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  deletedAt: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true, paranoid: true });

export default Community;
