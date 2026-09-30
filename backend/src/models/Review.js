import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// Reviews can be left for: recycler, repair_provider, organization, or a generic user
const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Who wrote the review
  reviewerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE',
  },
  // Who/what is being reviewed (a User with a specific role)
  revieweeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
    onDelete: 'CASCADE',
  },
  // The role context of the reviewee
  revieweeType: {
    type: DataTypes.ENUM('recycler', 'repair_provider', 'organization', 'user'),
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Optional: link to a specific transaction (repair request ID, listing ID, etc.)
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true, // 'repair_request' | 'listing' | 'waste_deposit'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // admin can mark as verified
  },
}, {
  timestamps: true,
  indexes: [
    // One review per reviewer per reviewee per type
    {
      unique: true,
      fields: ['reviewerId', 'revieweeId', 'revieweeType'],
    },
  ],
});

export default Review;
