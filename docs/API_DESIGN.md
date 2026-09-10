# EcoLoop - API Design

## Overview

This document defines the REST API design for EcoLoop backend.

**Base URL**: `https://api.ecoloop.com/api/v1`

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## API Endpoints

### 1. Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "securePassword123",
  "address": "123 Main St",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "user",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "message": "User registered successfully"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "address": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 2. Devices

#### Register Device
```http
POST /devices
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My iPhone 12",
  "category": "smartphone",
  "brand": "Apple",
  "model": "iPhone 12",
  "purchaseDate": "2021-03-15",
  "condition": "good",
  "usageHoursPerDay": 6,
  "location": {
    "city": "Delhi",
    "pincode": "110001"
  },
  "metadata": {
    "imei": "123456789012345",
    "color": "blue",
    "storage": "128GB"
  }
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My iPhone 12",
    "category": "smartphone",
    "brand": "Apple",
    "model": "iPhone 12",
    "purchaseDate": "2021-03-15",
    "condition": "good",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Get User's Devices
```http
GET /devices?page=1&limit=20&status=active
Authorization: Bearer <access_token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "My iPhone 12",
        "category": "smartphone",
        "brand": "Apple",
        "model": "iPhone 12",
        "purchaseDate": "2021-03-15",
        "condition": "good",
        "status": "active",
        "deathClock": {
          "deathDate": "2025-03-15",
          "remainingDays": 425,
          "health": 85,
          "status": "healthy"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

#### Get Device Details
```http
GET /devices/:id
Authorization: Bearer <access_token>
```

#### Update Device
```http
PUT /devices/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "condition": "fair",
  "name": "My iPhone 12 (Updated)"
}
```

#### Delete Device
```http
DELETE /devices/:id
Authorization: Bearer <access_token>
```

#### Get Death Clock Prediction
```http
GET /devices/:id/death-clock
Authorization: Bearer <access_token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "deviceId": "uuid",
    "deathDate": "2025-03-15T00:00:00Z",
    "remainingDays": 425,
    "remainingYears": 1.16,
    "health": 85,
    "status": "healthy",
    "factors": [
      {
        "name": "Age",
        "impact": -10,
        "description": "Device is 2.8 years old"
      },
      {
        "name": "Condition",
        "impact": -5,
        "description": "Good condition"
      },
      {
        "name": "Usage",
        "impact": -8,
        "description": "6 hours/day usage"
      }
    ],
    "recommendations": [
      "Consider backing up your data regularly",
      "Check battery health in settings",
      "Update to latest OS for security patches"
    ]
  }
}
```

---

### 3. Marketplace

#### Get Listings
```http
GET /marketplace/listings?category=smartphone&city=Delhi&maxPrice=10000&page=1&limit=20
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "device": {
          "id": "uuid",
          "name": "iPhone 12",
          "category": "smartphone",
          "brand": "Apple",
          "condition": "good"
        },
        "seller": {
          "id": "uuid",
          "name": "John Doe",
          "city": "Delhi",
          "rating": 4.5
        },
        "price": 8000,
        "status": "available",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

#### Create Listing
```http
POST /marketplace/listings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceId": "uuid",
  "price": 8000,
  "description": "Selling my iPhone 12 in good condition",
  "preferredMethod": "pickup"
}
```

#### Get Recyclers
```http
GET /marketplace/recyclers?city=Delhi&certification=iso14001
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Green Recyclers Pvt Ltd",
        "email": "contact@greenrecyclers.com",
        "phone": "+919876543210",
        "address": "456 Industrial Area",
        "city": "Delhi",
        "state": "Delhi",
        "certifications": ["iso14001", "epr"],
        "rating": 4.8,
        "totalTransactions": 150,
        "specialties": ["smartphone", "laptop", "tv"]
      }
    ]
  }
}
```

#### Request Pickup
```http
POST /marketplace/request-pickup
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "listingId": "uuid",
  "recyclerId": "uuid",
  "preferredDate": "2024-01-20",
  "preferredTime": "10:00-12:00",
  "notes": "Please call before arrival"
}
```

---

### 4. Transactions

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "listingId": "uuid",
  "buyerId": "uuid",
  "sellerId": "uuid",
  "price": 8000,
  "paymentMethod": "upi"
}
```

**Response (201 Created)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "listingId": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "price": 8000,
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Transaction Details
```http
GET /transactions/:id
Authorization: Bearer <access_token>
```

#### Update Transaction Status
```http
PUT /transactions/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "completed"
}
```

**Status Flow:**
```
pending → confirmed → in_progress → completed
                    → cancelled
```

---

### 5. Impact

#### Get User Impact
```http
GET /impact/user/:userId
Authorization: Bearer <access_token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "totalDevicesRecycled": 5,
    "totalCo2Saved": 250,
    "totalEnergySaved": 500,
    "totalMaterialsRecovered": 15,
    "impactBreakdown": [
      {
        "device": "iPhone 12",
        "co2Saved": 50,
        "energySaved": 100,
        "materialsRecovered": 3,
        "date": "2024-01-15"
      }
    ],
    "badges": [
      {
        "name": "First Recycler",
        "description": "Recycled your first device",
        "earnedAt": "2024-01-15"
      },
      {
        "name": "Eco Warrior",
        "description": "Recycled 5 devices",
        "earnedAt": "2024-06-15"
      }
    ]
  }
}
```

#### Get Global Impact
```http
GET /impact/global
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "totalDevicesRecycled": 10000,
    "totalCo2Saved": 500000,
    "totalEnergySaved": 1000000,
    "totalMaterialsRecovered": 30000,
    "totalUsers": 5000,
    "totalRecyclers": 100,
    "topCities": [
      {
        "city": "Delhi",
        "devicesRecycled": 2000,
        "co2Saved": 100000
      },
      {
        "city": "Mumbai",
        "devicesRecycled": 1500,
        "co2Saved": 75000
      }
    ]
  }
}
```

#### Calculate Impact
```http
POST /impact/calculate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "deviceId": "uuid",
  "action": "recycle"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "co2Saved": 50,
    "energySaved": 100,
    "materialsRecovered": 3,
    "waterSaved": 500,
    "unit": {
      "co2": "kg",
      "energy": "kWh",
      "materials": "kg",
      "water": "liters"
    }
  }
}
```

---

### 6. Admin

#### Get All Users
```http
GET /admin/users?page=1&limit=20&search=john
Authorization: Bearer <admin_token>
```

#### Get All Devices
```http
GET /admin/devices?page=1&limit=20&status=active
Authorization: Bearer <admin_token>
```

#### Get Platform Stats
```http
GET /admin/stats
Authorization: Bearer <admin_token>
```

**Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "totalUsers": 5000,
    "totalDevices": 12000,
    "totalTransactions": 3000,
    "totalRecyclers": 100,
    "totalCo2Saved": 500000,
    "activeUsers": 3500,
    "pendingTransactions": 50,
    "revenue": 2400000
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/*` | 10 requests/15min |
| `/devices/*` | 100 requests/15min |
| `/marketplace/*` | 100 requests/15min |
| All endpoints | 1000 requests/day |

---

## Versioning

API version is included in the URL path:
```
/api/v1/devices
/api/v2/devices  (future version)
```

---

## CORS

Allowed origins:
```javascript
[
  'http://localhost:5173',      // Vite dev server
  'http://localhost:3000',      // Alternative dev server
  'https://ecoloop.vercel.app', // Production frontend
]
```

---

## Webhooks (Future)

### Event Types
- `device.death_warning` - Device approaching end-of-life
- `transaction.completed` - Transaction completed
- `impact.milestone` - User reached impact milestone

### Webhook Payload
```json
{
  "event": "device.death_warning",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "deviceId": "uuid",
    "userId": "uuid",
    "remainingDays": 30,
    "message": "Your device is approaching end-of-life"
  }
}
```
