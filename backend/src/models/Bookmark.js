import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Posts', key: 'id' },
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'postId'],
    },
  ],
});

export default Bookmark;
