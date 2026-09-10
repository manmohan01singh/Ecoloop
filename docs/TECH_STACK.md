# EcoLoop - Technology Stack

## Overview

This document details the technology choices for EcoLoop, optimized for rapid development, scalability, and hackathon success.

---

## Frontend Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.2.8 | UI framework |
| **Vite** | ^8.3.0 | Build tool & dev server |
| **Tailwind CSS** | Latest | Utility-first CSS |

### Why These Choices?
- **Vite**: Lightning-fast HMR, optimized builds
- **React 19**: Latest features, concurrent rendering
- **Tailwind**: Rapid UI development, consistent design system

### Additional Libraries
```json
{
  "dependencies": {
    "react-router-dom": "^7.x",      // Routing
    "axios": "^1.x",                 // HTTP client
    "react-hook-form": "^7.x",       // Form handling
    "zod": "^3.x",                   // Schema validation
    "recharts": "^2.x",              // Charts & graphs
    "lucide-react": "^0.x",          // Icons
    "date-fns": "^4.x",              // Date utilities
    "clsx": "^2.x",                  // Conditional classes
    "framer-motion": "^11.x",        // Animations
    "react-hot-toast": "^2.x",       // Toast notifications
    "zustand": "^5.x"                // State management (lightweight)
  },
  "devDependencies": {
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "tailwindcss": "^3.x"
  }
}
```

### Frontend Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Select.jsx
│   │   ├── Badge.jsx
│   │   └── Loader.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── Container.jsx
│   ├── dashboard/
│   │   ├── DeathClock.jsx
│   │   ├── DeviceList.jsx
│   │   └── ImpactSummary.jsx
│   └── marketplace/
│       ├── ListingCard.jsx
│       ├── FilterPanel.jsx
│       └── RecyclerCard.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Devices.jsx
│   ├── Marketplace.jsx
│   ├── Impact.jsx
│   ├── Profile.jsx
│   └── Admin.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useDevices.js
│   ├── useMarketplace.js
│   └── useImpact.js
├── services/
│   ├── api.js              # Axios instance
│   ├── authService.js
│   ├── deviceService.js
│   ├── marketplaceService.js
│   └── impactService.js
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
└── assets/
    ├── images/
    └── icons/
```

---

## Backend Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ LTS | Runtime |
| **Express.js** | ^4.21 | Web framework |
| **PostgreSQL** | 15+ | Primary database |
| **Redis** | 7+ | Cache & queue |

### Why These Choices?
- **Express**: Mature, flexible, huge ecosystem
- **PostgreSQL**: Robust, ACID-compliant, great for complex queries
- **Redis**: Fast caching, session storage, job queues

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.21",              // Web framework
    "pg": "^8.13",                   // PostgreSQL client
    "sequelize": "^6.37",            // ORM
    "redis": "^4.7",                 // Redis client
    "jsonwebtoken": "^9.0",          // JWT auth
    "bcryptjs": "^2.4",              // Password hashing
    "dotenv": "^16.4",               // Environment variables
    "cors": "^2.8",                  // CORS middleware
    "helmet": "^8.0",                // Security headers
    "express-rate-limit": "^7.4",    // Rate limiting
    "express-validator": "^7.2",     // Input validation
    "winston": "^3.15",              // Logging
    "morgan": "^1.10",               // HTTP logging
    "compression": "^1.7",           // Response compression
    "nodemailer": "^6.9",            // Email sending
    "bull": "^4.12"                  // Job queue (uses Redis)
  },
  "devDependencies": {
    "nodemon": "^3.1",               // Dev auto-reload
    "jest": "^29.7",                 // Testing
    "supertest": "^7.0",             // API testing
    "sequelize-cli": "^6.6"          // DB migrations
  }
}
```

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Sequelize config
│   │   ├── redis.js            # Redis connection
│   │   ├── env.js              # Environment validation
│   │   └── constants.js        # App constants
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── device.controller.js
│   │   ├── marketplace.controller.js
│   │   ├── impact.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/
│   │   ├── index.js            # Model loader
│   │   ├── user.model.js
│   │   ├── device.model.js
│   │   ├── transaction.model.js
│   │   ├── recycler.model.js
│   │   └── impact.model.js
│   ├── routes/
│   │   ├── index.js            # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── device.routes.js
│   │   ├── marketplace.routes.js
│   │   ├── impact.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── device.service.js
│   │   ├── deathClock.service.js
│   │   ├── marketplace.service.js
│   │   ├── impact.service.js
│   │   └── notification.service.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── errors.js
│   └── app.js                  # Express app setup
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
├── migrations/                 # Sequelize migrations
├── seeders/                    # Database seeders
├── tests/
│   ├── unit/
│   └── integration/
└── package.json
```

---

## Database

### PostgreSQL
**Why PostgreSQL?**
- ACID compliance for transactions
- Complex relationships (devices, users, transactions)
- JSON support for flexible schemas
- Full-text search capability
- Proven at scale

**Key Features Used:**
- Foreign keys for data integrity
- Indexes for query performance
- JSONB for flexible device metadata
- Transactions for marketplace operations

### Redis
**Why Redis?**
- Sub-millisecond reads
- Session storage
- API rate limiting
- Background job queue (Bull)

**Use Cases:**
```javascript
// Cache keys
user:{id}                    // User session
device:{id}                  // Device details
death_clock:{device_id}      // Prediction results
marketplace:listings         // Active listings
impact:user:{id}             // User impact metrics

// Queues
notification:queue           // Email/SMS jobs
prediction:queue             // AI prediction jobs
```

---

## Authentication & Security

### JWT Authentication Flow
```
1. User registers → bcrypt hash password → store in DB
2. User logs in → verify password → generate JWT (access + refresh)
3. Client stores tokens (httpOnly cookie for refresh, memory for access)
4. Client sends access token in Authorization header
5. Server verifies token → grant/deny access
6. Access token expires (15min) → use refresh token to get new access token
```

### Security Measures
| Measure | Implementation |
|---------|----------------|
| **Password Hashing** | bcryptjs (10 rounds) |
| **JWT** | RS256 algorithm, short expiry |
| **Rate Limiting** | express-rate-limit (100 req/15min) |
| **CORS** | Whitelist frontend domain only |
| **Input Validation** | express-validator on all inputs |
| **SQL Injection** | Sequelize ORM (parameterized queries) |
| **XSS** | Helmet.js + sanitize inputs |
| **CSRF** | SameSite cookies + CSRF tokens |
| **HTTPS** | Required in production |

---

## Docker Setup

### Development
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ecoloop
      POSTGRES_PASSWORD: ecoloop_dev
      POSTGRES_DB: ecoloop_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://ecoloop:ecoloop_dev@postgres:5432/ecoloop_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev_secret_key
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

### Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: always
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: always

volumes:
  pgdata:
```

---

## Deployment

### Frontend: Vercel
```bash
# vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_URL": "https://api.ecoloop.com"
  }
}
```

### Backend: Railway / Render
```bash
# Environment variables
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
PORT=5000
```

### Alternative: Self-hosted
- **VPS**: DigitalOcean, Linode, AWS EC2
- **PaaS**: Heroku, Fly.io
- **Container**: AWS ECS, Google Cloud Run

---

## Monitoring & Logging

### Logging
```javascript
// Winston logger configuration
{
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
}
```

### Monitoring Tools
| Tool | Purpose |
|------|---------|
| **Winston** | Application logging |
| **Morgan** | HTTP request logging |
| **Prometheus** | Metrics collection |
| **Grafana** | Metrics visualization |
| **Sentry** | Error tracking |
| **UptimeRobot** | Uptime monitoring |

---

## Testing

### Frontend Testing
```json
{
  "vitest": "^2.x",
  "@testing-library/react": "^16.x",
  "@testing-library/jest-dom": "^6.x",
  "jsdom": "^25.x"
}
```

### Backend Testing
```json
{
  "jest": "^29.7",
  "supertest": "^7.0"
}
```

### Test Structure
```
tests/
├── unit/
│   ├── services/
│   │   ├── auth.service.test.js
│   │   ├── device.service.test.js
│   │   └── deathClock.service.test.js
│   └── utils/
│       └── helpers.test.js
└── integration/
    ├── auth.test.js
    ├── device.test.js
    └── marketplace.test.js
```

---

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd src && npm ci
      - run: cd src && npm run lint
      - run: cd src && npm run build

  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm test
```

---

## Performance Optimization

### Frontend
- **Code Splitting**: React.lazy + Suspense
- **Image Optimization**: WebP, lazy loading
- **Bundle Analysis**: vite-bundle-analyzer
- **Caching**: Service workers, HTTP cache headers

### Backend
- **Database Indexes**: On frequently queried columns
- **Query Optimization**: Eager loading, pagination
- **Caching**: Redis for hot data
- **Compression**: gzip responses
- **Connection Pooling**: Sequelize pool config

---

## Cost Estimation (Hackathon Phase)

| Service | Cost | Notes |
|---------|------|-------|
| **Vercel** | Free | Frontend hosting |
| **Railway** | $5-10/mo | Backend + DB |
| **Upstash Redis** | Free | Serverless Redis |
| **Domain** | $10-15/year | Optional |
| **Total** | ~$15-25/month | |

---

## Summary

This tech stack is:
- **Battle-tested**: All technologies are production-proven
- **Developer-friendly**: Great documentation, large communities
- **Scalable**: Can handle growth from hackathon to national scale
- **Cost-effective**: Free/low-cost for hackathon phase
- **Fast to develop**: Rapid iteration with Vite + Tailwind + Express
