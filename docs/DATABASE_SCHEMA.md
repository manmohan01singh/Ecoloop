# EcoLoop - Database Schema

## Overview

PostgreSQL database schema for EcoLoop platform.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    devices      │       │   death_clock   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ user_id (FK)    │◄──────│ device_id (FK)  │
│ name            │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │       │ death_date      │
│ phone           │       │ category        │       │ remaining_days  │
│ password_hash   │       │ brand           │       │ health_score    │
│ address         │       │ model           │       │ status          │
│ city            │       │ purchase_date   │       │ factors (JSONB) │
│ state           │       │ expected_life   │       │ predictions     │
│ pincode         │       │ condition       │       │ created_at      │
│ role            │       │ status          │       │ updated_at      │
│ created_at      │       │ location        │       └─────────────────┘
│ updated_at      │       │ metadata        │
└─────────────────┘       │ created_at      │
        │                 │ updated_at      │
        │                 └─────────────────┘
        │                         │
        │                         ▼
        │                 ┌─────────────────┐
        │                 │   listings      │
        │                 ├─────────────────┤
        │                 │ id (PK)         │
        │                 │ device_id (FK)  │
        │                 │ seller_id (FK)  │
        │                 │ price           │
        │                 │ description     │
        │                 │ status          │
        │                 │ created_at      │
        │                 │ updated_at      │
        │                 └─────────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  notifications  │       │  transactions   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ listing_id (FK) │
│ type            │       │ buyer_id (FK)   │
│ title           │       │ seller_id (FK)  │
│ message         │       │ price           │
│ data (JSONB)    │       │ status          │
│ status          │       │ payment_method  │
│ created_at      │       │ transaction_date│
│ read_at         │       │ created_at      │
└─────────────────┘       │ updated_at      │
                          └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   recyclers     │       │   impact_logs   │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ name            │       │ user_id (FK)    │
│ email           │       │ device_id (FK)  │
│ phone           │       │ transaction_id  │
│ address         │       │ action_type     │
│ city            │       │ co2_saved       │
│ state           │       │ energy_saved    │
│ certifications  │       │ materials_recov │
│ rating          │       │ water_saved     │
│ total_trans     │       │ created_at      │
│ created_at      │       └─────────────────┘
│ updated_at      │
└─────────────────┘
```

---

## Table Definitions

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'recycler', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_role ON users(role);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. Devices Table

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'smartphone', 'laptop', 'tablet', 'tv', 'refrigerator',
        'washing_machine', 'ac', 'computer', 'printer', 'other'
    )),
    brand VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE NOT NULL,
    expected_life_years INTEGER DEFAULT 5,
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN (
        'excellent', 'good', 'fair', 'poor', 'damaged'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'listed', 'sold', 'recycled', 'disposed'
    )),
    usage_hours_per_day DECIMAL(4,2) DEFAULT 4.0,
    location JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_category ON devices(category);
CREATE INDEX idx_devices_brand ON devices(brand);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_purchase_date ON devices(purchase_date);
CREATE INDEX idx_devices_condition ON devices(condition);
```

---

### 3. Death Clock Table

```sql
CREATE TABLE death_clock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    death_date TIMESTAMP NOT NULL,
    remaining_days INTEGER NOT NULL,
    health_score DECIMAL(5,2) NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'excellent', 'healthy', 'warning', 'critical', 'dead'
    )),
    factors JSONB NOT NULL DEFAULT '[]',
    predictions JSONB NOT NULL DEFAULT '{}',
    recommendations JSONB NOT NULL DEFAULT '[]',
    confidence_score DECIMAL(5,2) DEFAULT 85.00,
    model_version VARCHAR(50) DEFAULT 'v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_death_clock_device_id ON death_clock(device_id);
CREATE INDEX idx_death_clock_status ON death_clock(status);
CREATE INDEX idx_death_clock_death_date ON death_clock(death_date);
CREATE INDEX idx_death_clock_health_score ON death_clock(health_score);
```

---

### 4. Listings Table

```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    preferred_method VARCHAR(20) DEFAULT 'pickup' CHECK (preferred_method IN (
        'pickup', 'delivery', 'both'
    )),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN (
        'available', 'pending', 'sold', 'cancelled', 'expired'
    )),
    views_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_listings_device_id ON listings(device_id);
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created_at ON listings(created_at);
```

---

### 5. Recyclers Table

```sql
CREATE TABLE recyclers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    certifications JSONB DEFAULT '[]',
    specialties JSONB DEFAULT '[]',
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_transactions INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_recyclers_city ON recyclers(city);
CREATE INDEX idx_recyclers_rating ON recyclers(rating);
CREATE INDEX idx_recyclers_verified ON recyclers(verified);
```

---

### 6. Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recycler_id UUID REFERENCES recyclers(id) ON DELETE SET NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'
    )),
    payment_method VARCHAR(20) CHECK (payment_method IN (
        'upi', 'card', 'net_banking', 'cash', 'wallet'
    )),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded'
    )),
    transaction_date TIMESTAMP,
    pickup_date TIMESTAMP,
    completion_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
```

---

### 7. Impact Logs Table

```sql
CREATE TABLE impact_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'recycle', 'sell', 'donate', 'repair'
    )),
    co2_saved DECIMAL(10,2) DEFAULT 0,
    energy_saved DECIMAL(10,2) DEFAULT 0,
    materials_recovered DECIMAL(10,2) DEFAULT 0,
    water_saved DECIMAL(10,2) DEFAULT 0,
    units JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_impact_logs_user_id ON impact_logs(user_id);
CREATE INDEX idx_impact_logs_device_id ON impact_logs(device_id);
CREATE INDEX idx_impact_logs_action_type ON impact_logs(action_type);
CREATE INDEX idx_impact_logs_created_at ON impact_logs(created_at);
```

---

### 8. Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'death_warning', 'transaction_update', 'listing_update',
        'system', 'promotion', 'reminder'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN (
        'unread', 'read', 'archived'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

---

### 9. Badges Table

```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    criteria JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
```

---

### 10. Sessions Table (for refresh tokens)

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## Migrations (Sequelize)

### Example Migration File

```javascript
// migrations/20240115100000-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      // ... other fields
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
```

---

## Seed Data

### Sample Users
```javascript
[
  {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+919876543210',
    password_hash: '$2a$10$...',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    role: 'user'
  },
  {
    name: 'Green Recyclers',
    email: 'info@greenrecyclers.com',
    phone: '+919876543211',
    password_hash: '$2a$10$...',
    city: 'Delhi',
    state: 'Delhi',
    role: 'recycler'
  }
]
```

### Sample Devices
```javascript
[
  {
    user_id: 'uuid',
    name: 'My iPhone 12',
    category: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 12',
    purchase_date: '2021-03-15',
    condition: 'good',
    status: 'active',
    usage_hours_per_day: 6.0
  }
]
```

---

## Queries Examples

### Get User's Devices with Death Clock
```sql
SELECT 
    d.*,
    dc.death_date,
    dc.remaining_days,
    dc.health_score,
    dc.status as death_status
FROM devices d
LEFT JOIN death_clock dc ON d.id = dc.device_id
WHERE d.user_id = :userId
ORDER BY dc.remaining_days ASC;
```

### Get Marketplace Listings
```sql
SELECT 
    l.*,
    d.name as device_name,
    d.category,
    d.brand,
    d.condition,
    u.name as seller_name,
    u.city as seller_city,
    u.rating as seller_rating
FROM listings l
JOIN devices d ON l.device_id = d.id
JOIN users u ON l.seller_id = u.id
WHERE l.status = 'available'
ORDER BY l.created_at DESC
LIMIT 20 OFFSET 0;
```

### Calculate User Impact
```sql
SELECT 
    SUM(co2_saved) as total_co2,
    SUM(energy_saved) as total_energy,
    SUM(materials_recovered) as total_materials,
    COUNT(*) as total_actions
FROM impact_logs
WHERE user_id = :userId;
```

---

## Performance Optimization

### Indexes Strategy
- Primary keys (UUID)
- Foreign keys (user_id, device_id, etc.)
- Frequently filtered columns (status, category, city)
- Date columns for range queries

### Connection Pooling
```javascript
// Sequelize config
{
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
}
```

### Query Optimization
- Use `SELECT` with specific columns
- Eager loading with `include`
- Pagination with `LIMIT` and `OFFSET`
- Avoid `SELECT *` in production
