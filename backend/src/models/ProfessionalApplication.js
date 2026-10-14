import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProfessionalApplication = sequelize.define('ProfessionalApplication', {
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
  requestedRole: {
    type: DataTypes.ENUM('repair_provider', 'recycler', 'business', 'organization'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'under_review', 'approved', 'rejected', 'more_info_required', 'information_requested'),
    defaultValue: 'pending',
  },
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  contactName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
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
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  experienceYears: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  specializations: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  servicesOffered: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  website: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'Users', key: 'id' },
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  auditLog: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  paranoid: true,
});

export default ProfessionalApplication;
