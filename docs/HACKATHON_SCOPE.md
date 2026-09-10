# EcoLoop - Hackathon Scope & Demo Plan

## Goal

Create a **working demo** that showcases the core value proposition of EcoLoop: **predicting device end-of-life and connecting users with recyclers**.

---

## MVP Features (Must Have)

### 1. User Authentication
- [ ] Register with email/password
- [ ] Login
- [ ] JWT token management
- [ ] Protected routes

### 2. Device Management
- [ ] Add device (form with category, brand, model, purchase date)
- [ ] View all devices
- [ ] Device details page

### 3. Death Clock (Core Feature)
- [ ] Calculate device health score
- [ ] Show remaining days
- [ ] Visual indicator (color-coded: green/yellow/red)
- [ ] Death date prediction
- [ ] Recommendations

### 4. Marketplace
- [ ] List devices for recycling
- [ ] View available recyclers
- [ ] Request pickup

### 5. Impact Tracker
- [ ] Show CO2 saved
- [ ] Show energy saved
- [ ] Show materials recovered
- [ ] Visual charts

### 6. Landing Page
- [ ] Hero section with value proposition
- [ ] Features overview
- [ ] Call-to-action buttons
- [ ] Stats counter

---

## Demo Flow (5-minute presentation)

### Slide 1: Problem (30 seconds)
**Script:**
> "India generates 1.7 million metric tonnes of e-waste annually. 80% is processed by the informal sector, causing toxic exposure and environmental damage. There's no traceability from manufacture to disposal."

**Visual:**
- E-waste statistics
- Problem images

---

### Slide 2: Solution (30 seconds)
**Script:**
> "EcoLoop is a predictive platform that transforms e-waste management. Our Device Neural Twin technology predicts when devices will reach end-of-life, enabling proactive collection and recycling."

**Visual:**
- Platform overview diagram
- Key features

---

### Slide 3: Live Demo - User Registration (30 seconds)
**Action:**
1. Open landing page
2. Click "Get Started"
3. Register a new account
4. Show dashboard

**Script:**
> "Let me show you how it works. I'll register as a new user..."

---

### Slide 4: Live Demo - Add Device (45 seconds)
**Action:**
1. Click "Add Device"
2. Fill form: iPhone 12, purchased 3 years ago
3. Submit
4. Show device appears in dashboard

**Script:**
> "I'll add my iPhone 12 that I purchased 3 years ago..."

---

### Slide 5: Live Demo - Death Clock (60 seconds)
**Action:**
1. Click on device
2. Show Death Clock visualization
3. Highlight health score, remaining days
4. Show recommendations

**Script:**
> "This is our Death Clock feature. It predicts my iPhone will reach end-of-life in approximately 1 year. The health score is 65%, indicating it's approaching critical stage. The system recommends backing up data and checking battery health."

**Key Points:**
- Visual countdown
- Color-coded status
- Actionable recommendations

---

### Slide 6: Live Demo - Marketplace (45 seconds)
**Action:**
1. Click "List for Recycling"
2. Set price
3. Show listing appears in marketplace
4. View available recyclers

**Script:**
> "I can list my device for recycling. The marketplace connects me with certified recyclers in my area..."

---

### Slide 7: Live Demo - Impact Tracker (30 seconds)
**Action:**
1. Show impact dashboard
2. Highlight CO2 saved, energy saved
3. Show badges earned

**Script:**
> "Every action is tracked. I can see my environmental impact - CO2 saved, energy conserved, materials recovered. Gamification encourages responsible behavior."

---

### Slide 8: Technical Architecture (30 seconds)
**Visual:**
- Architecture diagram
- Tech stack logos

**Script:**
> "Built with React, Express, PostgreSQL, and Redis. Dockerized for easy deployment. AI-powered predictions using machine learning."

---

### Slide 9: Business Model & Traction (30 seconds)
**Script:**
> "Revenue through transaction fees, recycler subscriptions, and B2B partnerships. Our prototype has gained interest from 3 municipal corporations."

---

### Slide 10: Future Roadmap (30 seconds)
**Script:**
> "Post-hackathon, we're adding Mycoremediation Pods, E-Waste Credit system, and scaling to national deployment within 36 months."

---

### Slide 11: Team & Ask (30 seconds)
**Script:**
> "We're Team Jai Mahakaal. We're seeking mentorship and pilot opportunities to deploy EcoLoop in India. Thank you."

---

## Demo Checklist

### Pre-Demo
- [ ] Test all flows end-to-end
- [ ] Seed demo data (5-10 devices, 3-5 recyclers)
- [ ] Check internet connection
- [ ] Backup plan (video recording)
- [ ] Test on presentation device

### During Demo
- [ ] Speak clearly and confidently
- [ ] Point to key features
- [ ] Handle errors gracefully
- [ ] Keep to time limit

### Post-Demo
- [ ] Answer questions
- [ ] Collect feedback
- [ ] Network with judges/mentors

---

## Technical Implementation (Hackathon Sprint)

### Day 1: Backend Setup (8 hours)

#### Morning (4 hours)
- [ ] Initialize Express project
- [ ] Setup PostgreSQL + Redis (Docker)
- [ ] Create database schema
- [ ] Setup Sequelize ORM

#### Afternoon (4 hours)
- [ ] Build auth APIs (register, login, JWT)
- [ ] Build device CRUD APIs
- [ ] Test with Postman

### Day 2: Frontend + Integration (8 hours)

#### Morning (4 hours)
- [ ] Setup Tailwind CSS
- [ ] Build landing page
- [ ] Build auth pages (login, register)
- [ ] Setup React Router

#### Afternoon (4 hours)
- [ ] Build dashboard
- [ ] Build device management pages
- [ ] Integrate with backend APIs
- [ ] Test end-to-end

### Day 3: Death Clock + Polish (8 hours)

#### Morning (4 hours)
- [ ] Implement Death Clock algorithm
- [ ] Build Death Clock UI
- [ ] Add visualizations (charts, progress bars)

#### Afternoon (4 hours)
- [ ] Build marketplace pages
- [ ] Build impact tracker
- [ ] Add seed data
- [ ] Polish UI/UX
- [ ] Prepare demo script

---

## Death Clock Algorithm (MVP)

```javascript
function calculateDeathClock(device) {
  // Base lifespan by category (years)
  const categoryLifespan = {
    smartphone: 3,
    laptop: 5,
    tablet: 4,
    tv: 8,
    refrigerator: 15,
    washing_machine: 12,
    ac: 15,
    computer: 5,
    printer: 5
  };
  
  const baseLife = categoryLifespan[device.category] || 5;
  
  // Calculate age in years
  const ageInYears = (Date.now() - new Date(device.purchaseDate)) / (365 * 24 * 60 * 60 * 1000);
  
  // Calculate remaining life
  const remainingLife = Math.max(0, baseLife - ageInYears);
  
  // Calculate health score (0-100)
  const healthScore = (remainingLife / baseLife) * 100;
  
  // Determine status
  let status = 'excellent';
  if (healthScore < 20) status = 'critical';
  else if (healthScore < 40) status = 'warning';
  else if (healthScore < 60) status = 'fair';
  else if (healthScore < 80) status = 'good';
  
  // Calculate death date
  const deathDate = addYears(device.purchaseDate, baseLife);
  const remainingDays = Math.round(remainingLife * 365);
  
  // Generate recommendations
  const recommendations = [];
  if (healthScore < 40) {
    recommendations.push('Consider backing up your data immediately');
    recommendations.push('Check if device is eligible for trade-in');
  }
  if (device.category === 'smartphone') {
    recommendations.push('Check battery health in settings');
  }
  recommendations.push('Update to latest OS for security patches');
  
  return {
    deathDate,
    remainingDays,
    remainingYears: remainingLife.toFixed(1),
    healthScore: Math.round(healthScore),
    status,
    recommendations
  };
}
```

---

## UI/UX Guidelines

### Color Palette
```css
/* Primary */
--primary: #10B981;        /* Green - eco-friendly */
--primary-dark: #059669;

/* Status */
--success: #10B981;        /* Green */
--warning: #F59E0B;        /* Yellow */
--danger: #EF4444;         /* Red */
--info: #3B82F6;           /* Blue */

/* Neutral */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-500: #6B7280;
--gray-900: #111827;
```

### Typography
```css
--font-family: 'Inter', sans-serif;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl: 30px;
--font-size-3xl: 36px;
```

### Spacing
```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
```

---

## Seed Data for Demo

### Demo Users
```javascript
[
  {
    name: 'Demo User',
    email: 'demo@ecoloop.com',
    password: 'demo123',
    city: 'Delhi'
  },
  {
    name: 'Admin User',
    email: 'admin@ecoloop.com',
    password: 'admin123',
    role: 'admin'
  }
]
```

### Demo Devices
```javascript
[
  {
    name: 'iPhone 12',
    category: 'smartphone',
    brand: 'Apple',
    model: 'iPhone 12',
    purchaseDate: '2021-03-15',  // 3 years ago
    condition: 'good'
  },
  {
    name: 'MacBook Pro',
    category: 'laptop',
    brand: 'Apple',
    model: 'MacBook Pro 2019',
    purchaseDate: '2019-06-01',  // 5 years ago
    condition: 'fair'
  },
  {
    name: 'Samsung TV',
    category: 'tv',
    brand: 'Samsung',
    model: '55 inch',
    purchaseDate: '2018-01-01',  // 6 years ago
    condition: 'good'
  }
]
```

### Demo Recyclers
```javascript
[
  {
    name: 'Green Recyclers Pvt Ltd',
    city: 'Delhi',
    certifications: ['ISO 14001', 'EPR Authorized'],
    rating: 4.8
  },
  {
    name: 'EcoTech Solutions',
    city: 'Mumbai',
    certifications: ['ISO 14001'],
    rating: 4.5
  }
]
```

---

## Success Metrics (Hackathon)

| Metric | Target |
|--------|--------|
| Working demo | ✅ All features functional |
| User flow | ✅ Register → Add device → Death Clock → Marketplace |
| Visual appeal | ✅ Clean, professional UI |
| Presentation | ✅ 5-minute demo within time limit |
| Judges' score | ✅ Top 3 finish |

---

## Post-Hackathon Priorities

1. **AI Model**: Replace rule-based with ML predictions
2. **Mobile App**: React Native for iOS/Android
3. **Payment Integration**: UPI, cards for marketplace
4. **Notifications**: Email + SMS for death clock warnings
5. **Admin Panel**: Full dashboard for platform management
6. **Analytics**: Advanced impact calculations
7. **Pilot**: Partner with 1 municipal corporation

---

## Resources

- **Design**: Figma wireframes
- **Icons**: Lucide React
- **Images**: Unsplash (eco/recycling themed)
- **Charts**: Recharts
- **Animations**: Framer Motion

---

## Team Roles (Hackathon)

| Person | Role | Tasks |
|--------|------|-------|
| **Chetan** | Backend | APIs, database, auth, device CRUD |
| **Harsh** | AI/ML | Death Clock algorithm, impact calculations |
| **Jayant** | Frontend | UI components, pages, integration |
| **Manmohan** | Frontend | Landing page, marketplace, polish |

---

## Quick Start Commands

```bash
# Clone repo
git clone <repo-url>
cd ecoloop

# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd src
npm install
npm run dev

# Docker (database)
docker-compose up -d

# Access
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# Database: localhost:5432
```

---

## Final Checklist

### Code
- [ ] Clean, commented code
- [ ] Error handling
- [ ] Input validation
- [ ] Responsive design

### Demo
- [ ] Working end-to-end flow
- [ ] Seed data loaded
- [ ] Backup video ready
- [ ] Presentation slides

### Deployment
- [ ] Frontend on Vercel
- [ ] Backend on Railway
- [ ] Database provisioned
- [ ] Environment variables set

### Documentation
- [ ] README.md
- [ ] API documentation
- [ ] Setup instructions
- [ ] Demo script

---

**Good luck with the hackathon! 🚀**
