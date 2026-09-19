# EcoLoop - Implementation Roadmap for Missing Features
## Making All 9 Innovation Layers Production-Ready

**Current Status:** Application is running successfully!
- ✅ Backend: Running on port 5001
- ✅ Frontend: Running on port 5173
- ✅ Database: PostgreSQL + Redis connected
- ✅ Core features: 100% operational

---

## Quick Implementation Guide

This document provides step-by-step implementation plans for missing features from the 9 innovation layers.

---

## Layer 1: Device Neural Twin + Death Clock (COMPLETE ✅)

**Status:** 85% - Mostly done, needs ML upgrade

### Missing: ML-Based Prediction

**Current:** Rule-based algorithm
**Target:** Machine learning model

**Implementation Steps:**

1. **Collect Training Data** (1 week)
```javascript
// Add telemetry collection to Device model
Device.addColumn('telemetry', {
  batteryHealth: Number,
  cpuUsage: Number,
  temperature: Number,
  lastCheckDate: Date
});

// Track actual device failures
DeviceFailureLog {
  deviceId, failureDate, actualLifespan,
  failureReason, accuracyOfPrediction
}
```

2. **Train Simple Model** (1 week)
```python
# Python ML service
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# Features: age, usage, condition, category, brand
# Target: actual lifespan

model = RandomForestRegressor()
model.fit(X_train, y_train)
```

3. **Deploy as API** (2 days)
```javascript
// backend/src/services/mlPrediction.service.js
export const getMLPrediction = async (deviceData) => {
  const response = await axios.post('http://ml-service:5000/predict', deviceData);
  return response.data;
};
```

4. **A/B Test** (ongoing)
- 50% users get rule-based
- 50% users get ML-based
- Track accuracy over time

**Priority:** MEDIUM (current system works well)

---

## Layer 2: Mycoremediation Pods (NOT IMPLEMENTED ❌)

**Status:** 0% - Requires research & partnerships

### Implementation Plan

**Step 1: Create Database Models** (2 days)

```javascript
// backend/src/models/MycoremediationPod.js
const MycoremediationPod = sequelize.define('MycoremediationPod', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  location: { type: DataTypes.JSONB }, // address, coordinates
  providerId: { type: DataTypes.UUID, references: { model: 'Providers', key: 'id' } },
  fungiSpecies: { type: DataTypes.STRING(100) }, // e.g., "Pleurotus ostreatus"
  processingCapacity: { type: DataTypes.DECIMAL(10, 2) }, // kg per month
  status: { 
    type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
    defaultValue: 'active'
  },
  operatorName: { type: DataTypes.STRING(100) },
  operatorContact: { type: DataTypes.JSONB },
  certifications: { type: DataTypes.JSONB, defaultValue: [] },
  metadata: { type: DataTypes.JSONB } // temperature, humidity, growth conditions
}, { timestamps: true });

// backend/src/models/ProcessingBatch.js
const ProcessingBatch = sequelize.define('ProcessingBatch', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  podId: { type: DataTypes.UUID, allowNull: false, references: { model: 'MycoremediationPods' } },
  batchNumber: { type: DataTypes.STRING(50), unique: true },
  
  // Input
  inputDeviceIds: { type: DataTypes.JSONB, defaultValue: [] }, // array of device UUIDs
  inputMaterialType: { type: DataTypes.STRING(100) },
  inputWeightKg: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  
  // Process
  startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expectedEndDate: { type: DataTypes.DATE },
  actualEndDate: { type: DataTypes.DATE },
  processingDuration: { type: DataTypes.INTEGER }, // days
  
  // Output
  outputWeightKg: { type: DataTypes.DECIMAL(10, 3) },
  recoveryEfficiency: { type: DataTypes.DECIMAL(5, 2) }, // percentage
  
  status: {
    type: DataTypes.ENUM('preparing', 'processing', 'completed', 'failed'),
    defaultValue: 'preparing'
  },
  
  // Monitoring
  checkpoints: { type: DataTypes.JSONB, defaultValue: [] }, // array of { date, note, photos }
  issues: { type: DataTypes.TEXT },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

// backend/src/models/RecoveredMaterial.js
const RecoveredMaterial = sequelize.define('RecoveredMaterial', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  batchId: { type: DataTypes.UUID, allowNull: false, references: { model: 'ProcessingBatches' } },
  materialType: {
    type: DataTypes.ENUM('copper', 'gold', 'silver', 'aluminum', 'plastic', 'glass', 'rare_earth', 'other'),
    allowNull: false
  },
  weightKg: { type: DataTypes.DECIMAL(10, 4), allowNull: false },
  purity: { type: DataTypes.DECIMAL(5, 2) }, // percentage
  marketValue: { type: DataTypes.DECIMAL(12, 2) }, // USD or local currency
  disposition: {
    type: DataTypes.ENUM('sold', 'stored', 'refined_further', 'donated'),
    defaultValue: 'stored'
  },
  buyer: { type: DataTypes.STRING(200) },
  saleDate: { type: DataTypes.DATE },
  salePrice: { type: DataTypes.DECIMAL(12, 2) }
}, { timestamps: true });
```

**Step 2: Build Backend APIs** (2 days)

```javascript
// backend/src/controllers/mycoremediation.controller.js

// Admin/Provider: Register a pod
export const createPod = async (req, res) => {
  const pod = await MycoremediationPod.create({
    ...req.body,
    providerId: req.user.id
  });
  res.json({ success: true, data: pod });
};

// Provider: Start a new processing batch
export const startBatch = async (req, res) => {
  const { podId, deviceIds, materialType, inputWeightKg } = req.body;
  
  // Validate pod ownership
  const pod = await MycoremediationPod.findOne({
    where: { id: podId, providerId: req.user.id }
  });
  
  if (!pod) return res.status(403).json({ error: 'Not authorized' });
  
  const batchNumber = `BATCH-${Date.now()}`;
  const batch = await ProcessingBatch.create({
    podId, batchNumber,
    inputDeviceIds: deviceIds,
    inputMaterialType: materialType,
    inputWeightKg,
    expectedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
  
  // Update device status
  await Device.update(
    { status: 'processing', metadata: { batchId: batch.id } },
    { where: { id: deviceIds } }
  );
  
  res.json({ success: true, data: batch });
};

// Provider: Complete batch & record recovered materials
export const completeBatch = async (req, res) => {
  const { batchId, outputWeightKg, recoveredMaterials } = req.body;
  
  const batch = await ProcessingBatch.findByPk(batchId, {
    include: [{ model: MycoremediationPod }]
  });
  
  if (batch.MycoremediationPod.providerId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  // Calculate efficiency
  const efficiency = (outputWeightKg / batch.inputWeightKg) * 100;
  
  await batch.update({
    status: 'completed',
    actualEndDate: new Date(),
    outputWeightKg,
    recoveryEfficiency: efficiency
  });
  
  // Record recovered materials
  for (const material of recoveredMaterials) {
    await RecoveredMaterial.create({
      batchId: batch.id,
      ...material
    });
  }
  
  res.json({ success: true, data: batch });
};

// Public: Get pod statistics
export const getPodStats = async (req, res) => {
  const pods = await MycoremediationPod.findAll({
    include: [{
      model: ProcessingBatch,
      attributes: [],
      required: false
    }],
    attributes: [
      'id', 'name', 'location', 'status',
      [sequelize.fn('COUNT', sequelize.col('ProcessingBatches.id')), 'batchCount'],
      [sequelize.fn('SUM', sequelize.col('ProcessingBatches.inputWeightKg')), 'totalProcessed'],
      [sequelize.fn('AVG', sequelize.col('ProcessingBatches.recoveryEfficiency')), 'avgEfficiency']
    ],
    group: ['MycoremediationPod.id']
  });
  
  res.json({ success: true, data: pods });
};
```

**Step 3: Create Frontend UI** (3 days)

```jsx
// src/pages/MycoremediationDashboard.jsx
import { useState, useEffect } from 'react';
import { getPods, getBatches } from '../services/mycoService';

export default function MycoremediationDashboard() {
  const [pods, setPods] = useState([]);
  const [batches, setBatches] = useState([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const podsData = await getPods();
    const batchesData = await getBatches();
    setPods(podsData);
    setBatches(batchesData);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Mycoremediation Network</h1>
      
      {/* Map of pods */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Processing Pods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pods.map(pod => (
            <PodCard key={pod.id} pod={pod} />
          ))}
        </div>
      </section>
      
      {/* Active batches */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Active Processing Batches</h2>
        <div className="space-y-4">
          {batches.filter(b => b.status === 'processing').map(batch => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      </section>
      
      {/* Statistics */}
      <section className="mt-8">
        <StatsOverview pods={pods} batches={batches} />
      </section>
    </div>
  );
}
```

**Step 4: Integrate with Device Lifecycle** (1 day)

- Add "Send to Mycoremediation" button on Device detail page
- Update Device status to show "Processing at Pod XYZ"
- Link batch ID in device metadata

**Priority:** MEDIUM (innovative but requires partnerships)

---

## Layer 3: E-Waste Credit Collateral (NOT IMPLEMENTED ❌)

**Status:** 0% - Requires financial partnerships

⚠️ **WARNING:** This feature requires financial licensing and regulatory compliance.

### Implementation Plan

**Step 1: Create Valuation System** (1 week)

```javascript
// backend/src/models/DeviceValuation.js
const DeviceValuation = sequelize.define('DeviceValuation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  deviceId: { type: DataTypes.UUID, allowNull: false, unique: true },
  
  // Material value
  estimatedMaterialValue: { type: DataTypes.DECIMAL(10, 2) }, // based on components
  materialBreakdown: { type: DataTypes.JSONB }, // { copper: 50g, gold: 0.1g, ... }
  
  // Market value
  resaleValue: { type: DataTypes.DECIMAL(10, 2) }, // if sold as used device
  recyclingValue: { type: DataTypes.DECIMAL(10, 2) }, // if recycled
  
  // Collateral value (conservative estimate)
  collateralValue: { type: DataTypes.DECIMAL(10, 2) },
  collateralConfidence: { type: DataTypes.DECIMAL(5, 2) }, // 0-100
  
  valuationMethod: { type: DataTypes.STRING(100) }, // 'rule_based', 'market_data', 'expert'
  valuationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  validUntil: { type: DataTypes.DATE }, // valuations expire
  
  valuedBy: { type: DataTypes.UUID }, // admin or expert user
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });

// Associations
DeviceValuation.belongsTo(Device);
Device.hasOne(DeviceValuation);
```

**Valuation Algorithm:**
```javascript
// backend/src/services/valuation.service.js

const MATERIAL_COMPOSITION = {
  smartphone: {
    copper: 0.024, // kg
    gold: 0.00003, // kg
    silver: 0.00025,
    aluminum: 0.013,
    plastic: 0.040,
    glass: 0.020
  },
  laptop: {
    copper: 0.150,
    gold: 0.0002,
    silver: 0.002,
    aluminum: 0.300,
    plastic: 0.200
  }
  // ... other categories
};

const METAL_PRICES = {
  // USD per kg
  copper: 9.5,
  gold: 60000,
  silver: 750,
  aluminum: 2.5
};

export const calculateDeviceValuation = async (device) => {
  // 1. Material value
  const composition = MATERIAL_COMPOSITION[device.category] || {};
  const materialBreakdown = {};
  let materialValue = 0;
  
  for (const [metal, weight] of Object.entries(composition)) {
    const price = METAL_PRICES[metal] || 0;
    const value = weight * price;
    materialBreakdown[metal] = { weightKg: weight, valueUSD: value };
    materialValue += value;
  }
  
  // 2. Resale value (if device is functional)
  const deathClock = calculateDeathClock(device);
  let resaleValue = 0;
  if (deathClock.healthScore > 40) {
    // Estimate based on original price, age, condition
    const basePrice = DEVICE_BASE_PRICES[device.category] || 300;
    const ageMultiplier = Math.max(0, 1 - (deathClock.ageInYears / 5));
    const conditionMultiplier = CONDITION_MULTIPLIER[device.condition];
    resaleValue = basePrice * ageMultiplier * conditionMultiplier;
  }
  
  // 3. Recycling value
  const recyclingValue = materialValue * 0.7; // 70% recovery rate
  
  // 4. Collateral value (conservative: 50% of max value)
  const maxValue = Math.max(resaleValue, recyclingValue);
  const collateralValue = maxValue * 0.5;
  
  // 5. Confidence
  const confidence = device.purchaseDate && device.brand ? 85 : 60;
  
  return {
    estimatedMaterialValue: materialValue,
    materialBreakdown,
    resaleValue,
    recyclingValue,
    collateralValue,
    collateralConfidence: confidence,
    valuationMethod: 'rule_based',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
};
```

**Step 2: Create Collateral System** (1 week)

```javascript
// backend/src/models/Collateral.js
const Collateral = sequelize.define('Collateral', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  deviceId: { type: DataTypes.UUID, allowNull: false },
  valuationId: { type: DataTypes.UUID, allowNull: false },
  
  collateralValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: {
    type: DataTypes.ENUM('available', 'locked', 'in_use', 'released', 'liquidated'),
    defaultValue: 'available'
  },
  
  lockedAt: { type: DataTypes.DATE },
  lockedUntil: { type: DataTypes.DATE },
  lockedBy: { type: DataTypes.STRING(200) }, // lending institution
  
  releasedAt: { type: DataTypes.DATE },
  releaseReason: { type: DataTypes.TEXT },
  
  verificationProof: { type: DataTypes.JSONB }, // photos, documents
  storageLocation: { type: DataTypes.STRING(200) } // where device is physically held
}, { timestamps: true });

// backend/src/models/CreditAgreement.js
const CreditAgreement = sequelize.define('CreditAgreement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  agreementNumber: { type: DataTypes.STRING(50), unique: true },
  
  // Parties
  borrowerId: { type: DataTypes.UUID, allowNull: false },
  lenderId: { type: DataTypes.UUID }, // if internal platform lending
  lenderName: { type: DataTypes.STRING(200) }, // external institution name
  
  // Collateral
  collateralId: { type: DataTypes.UUID, allowNull: false },
  
  // Terms
  principalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  interestRate: { type: DataTypes.DECIMAL(5, 2) }, // APR
  termMonths: { type: DataTypes.INTEGER },
  monthlyPayment: { type: DataTypes.DECIMAL(10, 2) },
  
  // Dates
  startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  endDate: { type: DataTypes.DATE },
  
  // Status
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'defaulted', 'cancelled'),
    defaultValue: 'pending'
  },
  
  // Tracking
  amountDisbursed: { type: DataTypes.DECIMAL(12, 2) },
  amountRepaid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  outstandingBalance: { type: DataTypes.DECIMAL(12, 2) },
  
  completedAt: { type: DataTypes.DATE },
  defaultedAt: { type: DataTypes.DATE },
  
  terms: { type: DataTypes.TEXT }, // full legal terms
  signature: { type: DataTypes.JSONB } // digital signature
}, { timestamps: true });

// backend/src/models/CreditTransaction.js
const CreditTransaction = sequelize.define('CreditTransaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  agreementId: { type: DataTypes.UUID, allowNull: false },
  
  type: {
    type: DataTypes.ENUM('disbursement', 'repayment', 'interest', 'fee', 'penalty'),
    allowNull: false
  },
  
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  balanceBefore: { type: DataTypes.DECIMAL(12, 2) },
  balanceAfter: { type: DataTypes.DECIMAL(12, 2) },
  
  transactionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  method: { type: DataTypes.STRING(50) }, // 'bank_transfer', 'upi', 'cash'
  referenceNumber: { type: DataTypes.STRING(100) },
  
  notes: { type: DataTypes.TEXT },
  metadata: { type: DataTypes.JSONB }
}, { timestamps: true });
```

**Step 3: Build Credit APIs** (3 days)

```javascript
// backend/src/controllers/credit.controller.js

// User: Get device valuation
export const getDeviceValuation = async (req, res) => {
  const { deviceId } = req.params;
  
  const device = await Device.findOne({
    where: { id: deviceId, userId: req.user.id }
  });
  
  if (!device) return res.status(404).json({ error: 'Device not found' });
  
  // Check if recent valuation exists
  let valuation = await DeviceValuation.findOne({
    where: {
      deviceId,
      validUntil: { [Op.gt]: new Date() }
    }
  });
  
  // If no valid valuation, create new one
  if (!valuation) {
    const valuationData = await calculateDeviceValuation(device);
    valuation = await DeviceValuation.create({
      deviceId,
      ...valuationData
    });
  }
  
  res.json({ success: true, data: valuation });
};

// User: Lock device as collateral
export const lockCollateral = async (req, res) => {
  const { deviceId } = req.body;
  
  // Validate device ownership and status
  const device = await Device.findOne({
    where: {
      id: deviceId,
      userId: req.user.id,
      status: 'active' // only active devices can be collateral
    }
  });
  
  if (!device) return res.status(400).json({ error: 'Device not eligible for collateral' });
  
  // Get valuation
  const valuation = await DeviceValuation.findOne({
    where: { deviceId, validUntil: { [Op.gt]: new Date() } }
  });
  
  if (!valuation) return res.status(400).json({ error: 'Device requires valuation first' });
  
  // Check if already collateral
  const existingCollateral = await Collateral.findOne({
    where: { deviceId, status: ['locked', 'in_use'] }
  });
  
  if (existingCollateral) {
    return res.status(400).json({ error: 'Device already in use as collateral' });
  }
  
  // Create collateral record
  const collateral = await Collateral.create({
    userId: req.user.id,
    deviceId,
    valuationId: valuation.id,
    collateralValue: valuation.collateralValue,
    status: 'available'
  });
  
  // Update device status
  await device.update({ status: 'collateral' });
  
  res.json({ success: true, data: collateral });
};

// Admin/Lender: Create credit agreement
export const createCreditAgreement = async (req, res) => {
  const {
    borrowerId, collateralId,
    principalAmount, interestRate, termMonths
  } = req.body;
  
  // Validate collateral
  const collateral = await Collateral.findOne({
    where: { id: collateralId, status: 'available' },
    include: [{ model: DeviceValuation }]
  });
  
  if (!collateral) return res.status(400).json({ error: 'Collateral not available' });
  
  // Check loan-to-value ratio (max 80%)
  if (principalAmount > collateral.collateralValue * 0.8) {
    return res.status(400).json({
      error: 'Loan amount exceeds 80% of collateral value'
    });
  }
  
  // Calculate monthly payment
  const monthlyRate = interestRate / 12 / 100;
  const monthlyPayment = principalAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const agreementNumber = `CA-${Date.now()}`;
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + termMonths);
  
  const agreement = await CreditAgreement.create({
    agreementNumber,
    borrowerId,
    lenderId: req.user.id,
    lenderName: req.user.organizationName || 'EcoLoop Platform',
    collateralId,
    principalAmount,
    interestRate,
    termMonths,
    monthlyPayment,
    endDate,
    outstandingBalance: principalAmount,
    status: 'pending'
  });
  
  // Lock collateral
  await collateral.update({
    status: 'locked',
    lockedAt: new Date(),
    lockedUntil: endDate,
    lockedBy: req.user.organizationName
  });
  
  res.json({ success: true, data: agreement });
};

// Record payment
export const recordPayment = async (req, res) => {
  const { agreementId, amount, method, referenceNumber } = req.body;
  
  const agreement = await CreditAgreement.findByPk(agreementId);
  if (!agreement) return res.status(404).json({ error: 'Agreement not found' });
  
  const balanceBefore = agreement.outstandingBalance;
  const balanceAfter = balanceBefore - amount;
  
  // Record transaction
  await CreditTransaction.create({
    agreementId,
    type: 'repayment',
    amount,
    balanceBefore,
    balanceAfter,
    method,
    referenceNumber
  });
  
  // Update agreement
  await agreement.update({
    amountRepaid: agreement.amountRepaid + amount,
    outstandingBalance: balanceAfter
  });
  
  // If fully paid, complete agreement and release collateral
  if (balanceAfter <= 0) {
    await agreement.update({ status: 'completed', completedAt: new Date() });
    
    const collateral = await Collateral.findByPk(agreement.collateralId);
    await collateral.update({
      status: 'released',
      releasedAt: new Date(),
      releaseReason: 'Loan fully repaid'
    });
    
    const device = await Device.findByPk(collateral.deviceId);
    await device.update({ status: 'active' });
  }
  
  res.json({ success: true, data: agreement });
};
```

**Step 4: Create Frontend UI** (1 week)

```jsx
// src/pages/CreditMarketplace.jsx
export default function CreditMarketplace() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">E-Waste Credit Marketplace</h1>
      
      {/* User's eligible devices */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Devices (Use as Collateral)</h2>
        <DeviceCollateralCards />
      </section>
      
      {/* Active loans */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Active Loans</h2>
        <LoanCards />
      </section>
      
      {/* How it works */}
      <section>
        <HowItWorksExplainer />
      </section>
    </div>
  );
}
```

**Step 5: Partner Integration** (ongoing)

This feature REQUIRES external partnerships:
- Microfinance institutions
- Government e-waste programs
- NGOs
- Banks

**Priority:** HIGH (financial inclusion) but COMPLEX (regulatory)

---

## Layer 4: Children's E-Waste Schools (NOT IMPLEMENTED ❌)

**Status:** 0% - Requires educational partnerships

### Quick Implementation (2 weeks)

**Step 1: Database Models** (1 day)

```javascript
// backend/src/models/School.js
const School = sequelize.define('School', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  schoolCode: { type: DataTypes.STRING(50), unique: true },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(100) },
  district: { type: DataTypes.STRING(100) },
  principalName: { type: DataTypes.STRING(100) },
  contactEmail: { type: DataTypes.STRING(200) },
  contactPhone: { type: DataTypes.STRING(30) },
  studentCount: { type: DataTypes.INTEGER },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  verifiedAt: { type: DataTypes.DATE },
  verifiedBy: { type: DataTypes.UUID }
}, { timestamps: true });

// backend/src/models/SchoolClass.js
const SchoolClass = sequelize.define('SchoolClass', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  schoolId: { type: DataTypes.UUID, allowNull: false },
  grade: { type: DataTypes.INTEGER }, // 1-12
  section: { type: DataTypes.STRING(10) }, // A, B, C
  teacherId: { type: DataTypes.UUID }, // references User with role 'teacher'
  studentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalKarma: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });

// Extend User model
User.addColumn('role', {
  type: DataTypes.ENUM('user', 'moderator', 'admin', 'teacher', 'student', 'parent')
});

User.addColumn('schoolId', {
  type: DataTypes.UUID,
  references: { model: 'Schools', key: 'id' }
});

User.addColumn('classId', {
  type: DataTypes.UUID,
  references: { model: 'SchoolClasses', key: 'id' }
});

User.addColumn('parentUserId', {
  type: DataTypes.UUID,
  references: { model: 'Users', key: 'id' }
});

User.addColumn('parentalConsent', {
  type: DataTypes.BOOLEAN,
  defaultValue: false
});

User.addColumn('dateOfBirth', {
  type: DataTypes.DATEONLY
});

// backend/src/models/EducationalContent.js
const EducationalContent = sequelize.define('EducationalContent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), unique: true },
  ageGroup: {
    type: DataTypes.ENUM('6-8', '9-11', '12-14', '15-17'),
    allowNull: false
  },
  module: { type: DataTypes.STRING(100) }, // 'E-Waste Basics', 'Recycling', 'Circular Economy'
  contentType: {
    type: DataTypes.ENUM('article', 'video', 'quiz', 'activity', 'game'),
    allowNull: false
  },
  content: { type: DataTypes.TEXT },
  videoUrl: { type: DataTypes.STRING(300) },
  duration: { type: DataTypes.INTEGER }, // minutes
  objectives: { type: DataTypes.JSONB }, // learning objectives
  quiz: { type: DataTypes.JSONB }, // quiz questions and answers
  resources: { type: DataTypes.JSONB }, // PDFs, worksheets
  karmaReward: { type: DataTypes.INTEGER, defaultValue: 10 },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

// backend/src/models/StudentProgress.js
const StudentProgress = sequelize.define('StudentProgress', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID, allowNull: false },
  contentId: { type: DataTypes.UUID, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  completedAt: { type: DataTypes.DATE },
  score: { type: DataTypes.INTEGER }, // quiz score
  timeSpent: { type: DataTypes.INTEGER }, // minutes
  attempts: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { timestamps: true });

// backend/src/models/SchoolCollection.js
const SchoolCollection = sequelize.define('SchoolCollection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  schoolId: { type: DataTypes.UUID, allowNull: false },
  classId: { type: DataTypes.UUID },
  studentId: { type: DataTypes.UUID },
  materialType: { type: DataTypes.STRING(100), allowNull: false },
  weightKg: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  itemCount: { type: DataTypes.INTEGER },
  collectionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  karmaAwarded: { type: DataTypes.INTEGER },
  verifiedBy: { type: DataTypes.UUID }, // teacher verification
  photos: { type: DataTypes.JSONB },
  notes: { type: DataTypes.TEXT }
}, { timestamps: true });
```

**Step 2: Backend APIs** (2 days)

```javascript
// backend/src/controllers/school.controller.js

// Public: Register a school (teacher/principal)
export const registerSchool = async (req, res) => {
  const schoolCode = `SCH-${Date.now()}`;
  const school = await School.create({
    ...req.body,
    schoolCode
  });
  
  // Create teacher user account
  const teacher = await User.create({
    ...req.body.teacherInfo,
    role: 'teacher',
    schoolId: school.id
  });
  
  res.json({ success: true, data: { school, teacher } });
};

// Teacher: Register a class
export const registerClass = async (req, res) => {
  const { grade, section } = req.body;
  
  const schoolClass = await SchoolClass.create({
    schoolId: req.user.schoolId,
    teacherId: req.user.id,
    grade,
    section
  });
  
  res.json({ success: true, data: schoolClass });
};

// Teacher/Parent: Register a student
export const registerStudent = async (req, res) => {
  const { name, email, dateOfBirth, classId, parentEmail } = req.body;
  
  // Check age (must be appropriate for children)
  const age = (new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 6 || age > 18) {
    return res.status(400).json({ error: 'Age must be between 6-18' });
  }
  
  // Create parent account if provided
  let parentId = null;
  if (parentEmail) {
    let parent = await User.findOne({ where: { email: parentEmail } });
    if (!parent) {
      parent = await User.create({
        email: parentEmail,
        role: 'parent',
        name: `Parent of ${name}`
      });
    }
    parentId = parent.id;
  }
  
  // Create student account (requires parental consent)
  const student = await User.create({
    name,
    email,
    role: 'student',
    dateOfBirth,
    schoolId: req.user.schoolId,
    classId,
    parentUserId: parentId,
    parentalConsent: !!parentId
  });
  
  // Update class student count
  await SchoolClass.increment('studentCount', { where: { id: classId } });
  
  // Send parental consent email (if parent exists)
  if (parentId) {
    // await sendParentalConsentEmail(parentEmail, student.id);
  }
  
  res.json({ success: true, data: student });
};

// Public: Get educational content (filtered by age)
export const getEducationalContent = async (req, res) => {
  const { ageGroup, module, type } = req.query;
  
  const content = await EducationalContent.findAll({
    where: {
      ageGroup,
      ...(module && { module }),
      ...(type && { contentType: type }),
      isPublished: true
    },
    order: [['createdAt', 'DESC']]
  });
  
  res.json({ success: true, data: content });
};

// Student: Complete content
export const completeContent = async (req, res) => {
  const { contentId, score, timeSpent } = req.body;
  
  const content = await EducationalContent.findByPk(contentId);
  if (!content) return res.status(404).json({ error: 'Content not found' });
  
  // Check if already completed
  let progress = await StudentProgress.findOne({
    where: { studentId: req.user.id, contentId }
  });
  
  if (progress) {
    await progress.increment('attempts');
    await progress.update({ score, timeSpent, completed: true, completedAt: new Date() });
  } else {
    progress = await StudentProgress.create({
      studentId: req.user.id,
      contentId,
      score,
      timeSpent,
      completed: true,
      completedAt: new Date()
    });
  }
  
  // Award karma (only first time)
  if (progress.attempts === 1) {
    await awardEcoKarma(req.user.id, 'educational_content', content.karmaReward);
    
    // Update class total
    if (req.user.classId) {
      await SchoolClass.increment('totalKarma', {
        by: content.karmaReward,
        where: { id: req.user.classId }
      });
    }
  }
  
  res.json({ success: true, data: progress });
};

// Student/Teacher: Log collection
export const logSchoolCollection = async (req, res) => {
  const { materialType, weightKg, itemCount, studentId } = req.body;
  
  const collection = await SchoolCollection.create({
    schoolId: req.user.schoolId,
    classId: req.user.classId,
    studentId: studentId || req.user.id,
    materialType,
    weightKg,
    itemCount,
    verifiedBy: req.user.role === 'teacher' ? req.user.id : null
  });
  
  // Award karma
  const karma = Math.round(weightKg * 10); // 10 points per kg
  await awardEcoKarma(studentId || req.user.id, 'school_collection', karma);
  
  collection.karmaAwarded = karma;
  await collection.save();
  
  // Update class total
  if (req.user.classId) {
    await SchoolClass.increment('totalKarma', {
      by: karma,
      where: { id: req.user.classId }
    });
  }
  
  res.json({ success: true, data: collection });
};

// Public: School leaderboard
export const getSchoolLeaderboard = async (req, res) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = {};
  if (period === 'week') {
    dateFilter = { collectionDate: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  } else if (period === 'month') {
    dateFilter = { collectionDate: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  }
  
  const schools = await School.findAll({
    include: [{
      model: SchoolCollection,
      where: dateFilter,
      required: false,
      attributes: []
    }],
    attributes: [
      'id', 'name', 'city',
      [sequelize.fn('SUM', sequelize.col('SchoolCollections.karmaAwarded')), 'totalKarma'],
      [sequelize.fn('SUM', sequelize.col('SchoolCollections.weightKg')), 'totalWeight'],
      [sequelize.fn('COUNT', sequelize.col('SchoolCollections.id')), 'collectionCount']
    ],
    group: ['School.id'],
    order: [[sequelize.fn('SUM', sequelize.col('SchoolCollections.karmaAwarded')), 'DESC']],
    limit: 50
  });
  
  res.json({ success: true, data: schools });
};
```

**Step 3: Frontend UI** (1 week)

```jsx
// src/pages/SchoolDashboard.jsx
export default function SchoolDashboard() {
  const { user } = useAuth();
  
  if (user.role === 'teacher') {
    return <TeacherDashboard />;
  } else if (user.role === 'student') {
    return <StudentDashboard />;
  } else if (user.role === 'parent') {
    return <ParentDashboard />;
  }
  
  return <SchoolLandingPage />;
}

// src/pages/StudentDashboard.jsx
function StudentDashboard() {
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-2">Welcome, Eco Warrior! 🌟</h1>
      <p className="text-gray-600 mb-6">Let's save the planet together!</p>
      
      {/* Student stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🏆" label="EcoKarma" value="450" color="yellow" />
        <StatCard icon="📚" label="Lessons Completed" value="12" color="blue" />
        <StatCard icon="♻️" label="Items Collected" value="8" color="green" />
        <StatCard icon="🏅" label="Badges Earned" value="5" color="purple" />
      </div>
      
      {/* Learning path */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Learning Path</h2>
        <LearningPath />
      </section>
      
      {/* Leaderboard */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Class Leaderboard 🏆</h2>
        <ClassLeaderboard />
      </section>
    </div>
  );
}

// src/pages/EcoLearning.jsx (age-appropriate content)
function EcoLearning() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Eco Learning Center</h1>
      
      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModuleCard
          title="E-Waste Basics"
          description="Learn what e-waste is and why it matters"
          icon="📱"
          lessonsCount={5}
          progress={60}
        />
        <ModuleCard
          title="Recycling Heroes"
          description="How to sort and recycle properly"
          icon="♻️"
          lessonsCount={4}
          progress={25}
        />
        <ModuleCard
          title="Circular Economy"
          description="Understanding reduce, reuse, repair"
          icon="🔄"
          lessonsCount={6}
          progress={0}
        />
      </div>
    </div>
  );
}
```

**Step 4: Safety & Privacy** (critical!)

```javascript
// backend/src/middleware/childSafety.js

export const requireParentalConsent = async (req, res, next) => {
  if (req.user.role === 'student' && !req.user.parentalConsent) {
    return res.status(403).json({
      error: 'Parental consent required',
      consentUrl: `/consent/${req.user.id}`
    });
  }
  next();
};

export const filterChildData = (user) => {
  // Never expose: email, phone, exact address, full DOB
  return {
    id: user.id,
    name: user.firstName, // only first name
    age: calculateAge(user.dateOfBirth),
    schoolName: user.School?.name,
    karma: user.ecoKarma,
    badges: user.badges
  };
};

export const childSafeContent = async (req, res, next) => {
  // Filter out inappropriate content for children
  // Moderate user-generated content strictly
  next();
};
```

**Priority:** HIGH (social impact) + requires careful implementation

---

## Layer 5: Strategic Mineral Independence (25% DONE)

See FEATURE_IMPLEMENTATION_ANALYSIS.md for detailed plan.

**Quick wins:**
1. Add mineral taxonomy table
2. Map devices to minerals
3. Track mineral recovery in WasteDeposit
4. Build admin dashboard

**Time:** 1 week

---

## Layer 6: Death Registry Enhancement (60% DONE)

See FEATURE_IMPLEMENTATION_ANALYSIS.md for detailed plan.

**Quick wins:**
1. Add DeathRegistry table
2. Add lifecycle event logging
3. Add surrender workflow

**Time:** 3 days

---

## Layer 7: Living Building Protocol (40% DONE)

**Quick Implementation:**

```javascript
// Extend Location model
Location.addColumn('buildingId', {
  type: DataTypes.UUID,
  references: { model: 'Buildings', key: 'id' }
});

// New Building model
const Building = sequelize.define('Building', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  address: { type: DataTypes.TEXT },
  buildingType: {
    type: DataTypes.ENUM('residential', 'commercial', 'office', 'school', 'hospital', 'mall'),
    allowNull: false
  },
  size: { type: DataTypes.INTEGER }, // square meters
  floors: { type: DataTypes.INTEGER },
  occupancy: { type: DataTypes.INTEGER },
  managerId: { type: DataTypes.UUID }, // building manager user
  certifications: { type: DataTypes.JSONB }, // LEED, green building certs
  collectionPointCount: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });

// Building associations
Building.hasMany(Location);
Location.belongsTo(Building);
```

**API:**
```javascript
// Get building with all collection points
export const getBuildingDetails = async (req, res) => {
  const building = await Building.findByPk(req.params.id, {
    include: [{
      model: Location,
      where: { category: 'collection_point' }
    }]
  });
  
  // Get collection stats
  const stats = await WasteDeposit.findAll({
    where: {
      providerId: { [Op.in]: building.Locations.map(l => l.id) }
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('weightKg')), 'totalWeight'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalDeposits']
    ]
  });
  
  res.json({ success: true, data: { building, stats } });
};
```

**Time:** 3 days

---

## Layer 8: Soil Contamination (70% DONE)

**Quick Enhancement:**

Extend Report model:
```javascript
Report.addColumn('contaminationData', {
  type: DataTypes.JSONB,
  // { leadLevel: 50, mercuryLevel: 2, ph: 6.5, riskLevel: 'medium' }
});

// Add alert threshold
const ContaminationThreshold = sequelize.define('ContaminationThreshold', {
  parameter: { type: DataTypes.STRING(50), allowNull: false },
  warningLevel: { type: DataTypes.DECIMAL(10, 4) },
  dangerLevel: { type: DataTypes.DECIMAL(10, 4) },
  unit: { type: DataTypes.STRING(20) }
});

// Alert service
export const checkContaminationThresholds = async (reportId) => {
  const report = await Report.findByPk(reportId);
  const thresholds = await ContaminationThreshold.findAll();
  
  for (const threshold of thresholds) {
    const value = report.contaminationData[threshold.parameter];
    if (value >= threshold.dangerLevel) {
      await createAlert(report, threshold, 'danger');
    } else if (value >= threshold.warningLevel) {
      await createAlert(report, threshold, 'warning');
    }
  }
};
```

**Time:** 2 days

---

## Layer 9: Sacred Infrastructure (50% DONE)

**Quick Enhancement:**

```javascript
// Extend Location categories
Location.update('category', {
  type: DataTypes.ENUM([
    'recycling_center', 'waste_bank', 'collector', 'repair_shop',
    'collection_point', 'community_hub', 'donation_center',
    'temple', 'church', 'mosque', 'gurdwara', 'monastery', // NEW
    'religious_institution', 'other'
  ])
});

// Add institutional profile
const SacredNode = sequelize.define('SacredNode', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  locationId: { type: DataTypes.UUID, unique: true },
  institutionType: { type: DataTypes.STRING(100) },
  religiousOrder: { type: DataTypes.STRING(100) },
  communitySize: { type: DataTypes.INTEGER },
  leaderName: { type: DataTypes.STRING(100) },
  trustLevel: { type: DataTypes.INTEGER, defaultValue: 0 },
  specialEvents: { type: DataTypes.JSONB }, // festivals, collection drives
}, { timestamps: true });
```

**Time:** 2 days

---

## Summary: Quick Implementation Timeline

### Week 1 (5 days)
- Death Registry enhancement ✅
- Building Protocol ✅
- Sacred Network enhancement ✅
- Soil Monitoring enhancement ✅

### Week 2 (5 days)
- Strategic Minerals tracking ✅
- Admin dashboards for new features ✅
- Testing & bug fixes ✅

### Month 2 (4 weeks)
- Children's Schools full system
- Mycoremediation Pods MVP

### Month 3+ (ongoing)
- E-Waste Credit Collateral (requires partnerships)
- ML-based predictions
- IoT integration

---

## Current Application Status

✅ **Backend:** Running on port 5001
✅ **Frontend:** Running on port 5173
✅ **Database:** PostgreSQL + Redis connected
✅ **Core Features:** 100% operational

**Test Credentials:**
- Admin: admin@ecoloop.com / admin123
- Organization: fajar@ecoloop.com / demo123
- User: demo@ecoloop.com / demo123

**Access Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

---

**Ready to implement?** Start with the quick wins in Week 1!

