# EcoLoop - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   React UI  │  │  Tailwind   │  │   React Router + State  │ │
│  │  Components │  │     CSS     │  │      Management         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY (Express)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │    Auth     │  │   Rate      │  │     Request             │ │
│  │ Middleware  │  │  Limiting   │  │     Validation          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────────┐│
│  │  Device   │ │  Death    │ │ Marketplace│ │   Notification   ││
│  │  Service  │ │  Clock    │ │  Service   │ │    Service       ││
│  └───────────┘ └───────────┘ └───────────┘ └──────────────────┘│
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────────┐│
│  │   User    │ │  Impact   │ │  Admin     │ │   Analytics      ││
│  │  Service  │ │  Service  │ │  Service   │ │    Service       ││
│  └───────────┘ └───────────┘ └───────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │   PostgreSQL     │  │      Redis       │  │  File Storage  ││
│  │  (Primary DB)    │  │    (Cache/Queue) │  │   (Optional)   ││
│  └──────────────────┘  └──────────────────┘  └────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────────┐│
│  │  ML/AI    │ │  Email    │ │  Payment  │ │   SMS/WhatsApp   ││
│  │  Service  │ │  Service  │ │  Gateway  │ │    Service       ││
│  └───────────┘ └───────────┘ └───────────┘ └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend (Vite + React + Tailwind)

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Modal)
│   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── dashboard/       # Dashboard-specific components
│   ├── marketplace/     # Marketplace components
│   └── common/          # Shared components
├── pages/
│   ├── auth/            # Login, Register, Forgot Password
│   ├── dashboard/       # User dashboard
│   ├── devices/         # Device management
│   ├── marketplace/     # E-waste marketplace
│   ├── impact/          # Environmental impact tracker
│   └── admin/           # Admin panel
├── hooks/               # Custom React hooks
├── services/            # API integration
├── context/             # Global state management
├── utils/               # Helper functions
└── assets/              # Static assets
```

**Key Pages:**
- `/` - Landing page
- `/dashboard` - User dashboard with Death Clock
- `/devices` - Device registration & management
- `/marketplace` - E-waste marketplace
- `/impact` - Environmental impact metrics
- `/profile` - User profile
- `/admin` - Admin panel

---

### 2. Backend (Express.js)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # PostgreSQL connection
│   │   ├── redis.js         # Redis connection
│   │   ├── env.js           # Environment variables
│   │   └── constants.js     # App constants
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── device.controller.js
│   │   ├── marketplace.controller.js
│   │   ├── impact.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── device.model.js
│   │   ├── transaction.model.js
│   │   ├── recycler.model.js
│   │   └── impact.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── device.routes.js
│   │   ├── marketplace.routes.js
│   │   ├── impact.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── device.service.js
│   │   ├── deathClock.service.js   # AI prediction logic
│   │   ├── marketplace.service.js
│   │   ├── impact.service.js
│   │   └── notification.service.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── app.js
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
└── package.json
```

---

### 3. Database Schema (PostgreSQL)

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │    devices      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ user_id (FK)    │
│ name            │       │ id (PK)         │
│ email           │       │ name            │
│ phone           │       │ category        │
│ password_hash   │       │ brand           │
│ address         │       │ model           │
│ city            │       │ purchase_date   │
│ state           │       │ expected_life   │
│ pincode         │       │ death_date      │
│ role            │       │ status          │
│ created_at      │       │ condition       │
│ updated_at      │       │ location        │
└─────────────────┘       │ created_at      │
                          └─────────────────┘
                                  │
                                  ▼
┌─────────────────┐       ┌─────────────────┐
│  transactions   │       │   recyclers     │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ device_id (FK)  │       │ name            │
│ seller_id (FK)  │       │ email           │
│ buyer_id (FK)   │       │ phone           │
│ price           │       │ location        │
│ status          │       │ certification   │
│ transaction_date│       │ rating          │
│ created_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   impact_logs   │       │   notifications │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │
│ device_id (FK)  │       │ type            │
│ co2_saved       │       │ title           │
│ energy_saved    │       │ message         │
│ materials_recov │       │ status          │
│ action_type     │       │ created_at      │
│ created_at      │       └─────────────────┘
└─────────────────┘
```

---

### 4. Redis Usage

**Cache Keys:**
- `user:{id}` - User session data
- `device:{id}` - Device details
- `death_clock:{device_id}` - Prediction results
- `marketplace:listings` - Active listings
- `impact:user:{id}` - User impact metrics

**Queue:**
- `notification:queue` - Email/SMS notifications
- `prediction:queue` - AI prediction jobs

---

### 5. Docker Setup

```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/ecoloop
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=ecoloop
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=ecoloop
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000

volumes:
  pgdata:
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
POST   /api/auth/logout        # Logout user
GET    /api/auth/me            # Get current user
PUT    /api/auth/profile       # Update profile
```

### Devices
```
GET    /api/devices            # Get user's devices
POST   /api/devices            # Register new device
GET    /api/devices/:id        # Get device details
PUT    /api/devices/:id        # Update device
DELETE /api/devices/:id        # Delete device
GET    /api/devices/:id/death-clock  # Get death prediction
```

### Marketplace
```
GET    /api/marketplace/listings     # Get all listings
POST   /api/marketplace/listings     # Create listing
GET    /api/marketplace/listings/:id # Get listing details
PUT    /api/marketplace/listings/:id # Update listing
DELETE /api/marketplace/listings/:id # Delete listing
POST   /api/marketplace/transactions # Create transaction
```

### Impact
```
GET    /api/impact/user/:id    # Get user's impact
GET    /api/impact/global      # Get global impact
POST   /api/impact/calculate   # Calculate impact for action
```

### Admin
```
GET    /api/admin/users        # Get all users
GET    /api/admin/devices      # Get all devices
GET    /api/admin/transactions # Get all transactions
GET    /api/admin/stats        # Get platform statistics
```

---

## Security Considerations

1. **Authentication**: JWT with refresh tokens
2. **Authorization**: Role-based access control (User, Recycler, Admin)
3. **Input Validation**: Zod/Joi for request validation
4. **Rate Limiting**: Prevent API abuse
5. **CORS**: Configured for frontend domain only
6. **Environment Variables**: Never commit secrets
7. **SQL Injection**: Parameterized queries (Sequelize/Prisma)
8. **XSS Protection**: Sanitize user inputs
9. **HTTPS**: Required for production

---

## Scalability

- **Horizontal Scaling**: Express API behind load balancer
- **Database**: Read replicas, connection pooling
- **Cache**: Redis cluster for high availability
- **Queue**: Bull/BullMQ for background jobs
- **CDN**: Static assets via CDN
- **Microservices**: Future split into separate services
