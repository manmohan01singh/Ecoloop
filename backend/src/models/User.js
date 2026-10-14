import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'recycler', 'repair_provider', 'business', 'organization', 'admin'),
    defaultValue: 'user',
  },
  ecoKarmaTotal: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verificationStatus: {
    type: DataTypes.ENUM('unverified', 'community_verified', 'admin_verified'),
    defaultValue: 'unverified',
  },
  subscriptionTier: {
    type: DataTypes.ENUM('free', 'basic', 'premium'),
    defaultValue: 'free',
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  followerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  followingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  hooks: {
    beforeValidate: async (user) => {
      if (!user.username) {
        const base = (user.name || user.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20) || 'user';
        const rand = Math.random().toString(36).substring(2, 6);
        user.username = `${base}_${rand}`;
      }
    },
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;
