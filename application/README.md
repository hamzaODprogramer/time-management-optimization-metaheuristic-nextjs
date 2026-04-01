# ⏰ Time Management Optimization System

<div align="center">

![NextJS](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-61.9%25-3178C6?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-7.2%25-3776AB?style=flat-square&logo=python)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A modern, AI-powered timetable management system built with **Next.js** that optimizes class scheduling for educational institutions using the **Simulated Annealing (SA)** metaheuristic algorithm.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Algorithm](#-algorithm) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Algorithm Details](#-algorithm-details)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

This project demonstrates the practical application of the **Simulated Annealing (SA)** metaheuristic to solve the complex **timetable scheduling problem**. It provides a comprehensive web-based interface for managing educational institution schedules with intelligent optimization capabilities.

### Why Simulated Annealing?

Simulated Annealing is a probabilistic optimization technique inspired by the annealing process in metallurgy. It's particularly effective for:
- **Non-convex optimization problems** (like timetable scheduling)
- **Avoiding local optima** through controlled randomization
- **Balancing exploration and exploitation** via temperature cooling
- **Constraint satisfaction** with multiple conflicting requirements

---

## ✨ Features

### 🔐 Authentication & Security
- Secure login/signup system with session management
- Password hashing with industry-standard algorithms
- Cookie-based session handling

### 📊 Dashboard
- System statistics overview
- Quick action buttons
- Real-time schedule visualization
- Performance metrics

### 📅 Schedule Management
- **View optimized weekly timetable** with visual conflict detection
- **Group and room assignment visualization** 
- **Conflict detection** and resolution suggestions
- Interactive calendar interface

### 🗂️ Data Management
- **Manage student groups** - Create, edit, delete groups
- **Manage teaching staff** - Add instructors with availability
- **Manage classrooms & facilities** - Define room types and capacities
- **Manage courses and classes** - Course setup with constraints

### 🤖 Intelligent Optimization Algorithm
The system applies Simulated Annealing to achieve:
- ✅ Respect room capacity requirements
- ✅ Honor preferred room types
- ✅ Avoid scheduling conflicts
- ✅ Maximize resource utilization
- ✅ Handle complex constraints dynamically

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | Modern, performant UI framework |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Accessible, customizable components |
| **Backend** | Next.js API Routes | Serverless functions |
| **Database** | SQLite + better-sqlite3 | Lightweight, zero-config DB |
| **Authentication** | Cookie Sessions | Secure session management |
| **Language** | TypeScript | Type-safe development |
| **Optimization** | Simulated Annealing | Metaheuristic algorithm |

### Language Composition
```
TypeScript   ████████████████░░░░░  61.9%
Jupyter      ██████░░░░░░░░░░░░░░░  27.6%
Python       ██░░░░░░░░░░░░░░░░░░░   7.2%
CSS          ░░░░░░░░░░░░░░░░░░░░░   1.7%
JavaScript   ░░░░░░░░░░░░░░░░░░░░░   1.5%
Shell        ░░░░░░░░░░░░░░░░░░░░░   0.1%
```

---

## 📁 Project Structure

```
time-management-optimization-metaheuristic-nextjs/
├── application/
│   ├── src/
│   │   ├── app/              # Next.js app directory
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities & helpers
│   │   │   └── db.ts         # SQLite database setup
│   │   ├── pages/            # API routes
│   │   └── styles/           # Global styles
│   ├── scripts/
│   │   └── seed-database.ts  # Database initialization
│   ├── public/               # Static assets
│   └── package.json
├── backend/                  # Flask optimization service
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
└── notebooks/                # Jupyter notebooks for experimentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- Optional: **Python 3.8+** for backend service

### Installation

#### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/hamzaODprogramer/time-management-optimization-metaheuristic-nextjs.git
cd time-management-optimization-metaheuristic-nextjs/application
npm install
```

#### Step 2: Initialize Database
```bash
npx ts-node scripts/seed-database.ts
```

This creates an SQLite database with:
- Pre-configured time slots
- Sample classrooms
- Initial user authentication

#### Step 3: Start Development Server
```bash
npm run dev
```

#### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### First Time Login

1. Click **"Sign up"** on the login page
2. Create an admin account:
   - **Email**: your-email@example.com
   - **Password**: secure-password
3. You'll be redirected to the dashboard

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the `application/` directory:

```env
# Database Configuration
DATABASE_PATH=./data.db

# Session Security
SESSION_SECRET=your-super-secret-key-min-32-chars-long

# API Configuration
API_PORT=3000

# Optimization Parameters
SA_INITIAL_TEMP=1000
SA_COOLING_RATE=0.99
SA_MIN_TEMP=0.01
```

### Database Configuration

The system uses **SQLite** with the `better-sqlite3` driver for performance:

```typescript
// lib/db.ts configuration example
const db = new Database('./data.db');
db.pragma('journal_mode = WAL');  // Write-Ahead Logging for concurrency
```

---

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | Register new admin account |
| `GET` | `/api/auth/session` | Check current session status |
| `POST` | `/api/auth/logout` | Logout user |

**Example Login Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Data Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups` | Retrieve all student groups |
| `POST` | `/api/groups` | Create new student group |
| `GET` | `/api/teachers` | Retrieve all teachers |
| `POST` | `/api/teachers` | Add new teacher |
| `GET` | `/api/rooms` | Retrieve all classrooms |
| `POST` | `/api/rooms` | Add new room |
| `GET` | `/api/courses` | Retrieve all courses |
| `POST` | `/api/courses` | Create new course |

### Schedule Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/optimize` | **Generate optimized schedule** |
| `GET` | `/api/schedule` | View generated schedule |
| `GET` | `/api/schedule/:id` | Get specific schedule |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/stats` | System statistics |
| `POST` | `/api/init` | Initialize database |

---

## 🗄️ Database Schema

### Tables Overview

#### `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `groups` (Student Groups/Classes)
```sql
CREATE TABLE groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  student_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `teachers` (Teaching Staff)
```sql
CREATE TABLE teachers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  availability TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `rooms` (Classrooms & Facilities)
```sql
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  room_type TEXT,
  equipment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `timeslots` (Available Time Periods)
```sql
CREATE TABLE timeslots (
  id INTEGER PRIMARY KEY,
  day_of_week TEXT,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER
);
```

#### `courses` (Classes to Schedule)
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id INTEGER,
  group_id INTEGER,
  min_capacity INTEGER,
  preferred_room_type TEXT,
  duration_minutes INTEGER,
  FOREIGN KEY(teacher_id) REFERENCES teachers(id),
  FOREIGN KEY(group_id) REFERENCES groups(id)
);
```

#### `schedule` (Generated Assignments)
```sql
CREATE TABLE schedule (
  id INTEGER PRIMARY KEY,
  course_id INTEGER,
  timeslot_id INTEGER,
  room_id INTEGER,
  assignment_score REAL,
  FOREIGN KEY(course_id) REFERENCES courses(id),
  FOREIGN KEY(timeslot_id) REFERENCES timeslots(id),
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);
```

---

## 🤖 Algorithm Details: Simulated Annealing

### What is Simulated Annealing?

**Simulated Annealing (SA)** is a probabilistic metaheuristic inspired by the annealing process used in metallurgy. It's used to find approximate global optima in large search spaces.

### Algorithm Overview

```
1. Initialize solution S randomly
2. Initialize temperature T = T_initial
3. While T > T_minimum:
   a. Generate neighbor solution S' by small perturbation of S
   b. Calculate delta_E = Energy(S') - Energy(S)
   c. If delta_E < 0 (improvement):
      Accept S' as new solution
   d. Else (worse solution):
      Accept S' with probability = e^(-delta_E/T)
   e. Update T: T = T * cooling_rate
4. Return best solution found
```

### Application to Timetable Scheduling

#### Problem Formulation

**Objective:** Assign courses to timeslots and rooms while minimizing conflicts

**Variables:**
- Course assignments to (timeslot, room) pairs
- Binary decision variables: x[c,t,r] = 1 if course c is scheduled at time t in room r

**Constraints:**
- Each course assigned exactly once
- No room double-booking
- Room capacity ≥ course minimum capacity
- Room type matches preference (if specified)
- No teacher conflicts (optional)

#### Cost Function (Energy)

```
E(solution) = w1 * conflicts + w2 * capacity_violations + 
              w3 * room_mismatches + w4 * unscheduled_courses

where w_i are weight parameters balancing different objectives
```

#### Implementation Details

1. **Initialization**: Random valid schedule generation
2. **Perturbation**: Move a course to a different valid (timeslot, room)
3. **Acceptance Criterion**: Metropolis criterion with temperature-dependent probability
4. **Cooling Schedule**: T(k) = T₀ * α^k (geometric cooling, α ≈ 0.99)

#### Advantages for This Problem

✅ **Escapes local optima** through probabilistic acceptance  
✅ **Handles hard constraints** efficiently  
✅ **Scalable** to large instances (100+ courses)  
✅ **Parameter tuning** allows quality-speed trade-off  
✅ **Proven convergence** to global optimum (asymptotically)

#### Tunable Parameters

```typescript
interface SAConfig {
  initialTemp: number;      // Starting temperature (default: 1000)
  minTemp: number;          // Stopping criterion (default: 0.01)
  coolingRate: number;      // T_new = T_old * coolingRate (default: 0.99)
  maxIterations: number;    // Per temperature level (default: 100)
  weights: {
    conflicts: number;      // Weight for scheduling conflicts
    capacity: number;       // Weight for capacity violations
    roomType: number;       // Weight for room type mismatches
  }
}
```

#### Computational Complexity

- **Time**: O(n * log(T₀/T_min)) where n = number of courses
- **Space**: O(n) for solution representation

### Performance Metrics

The system tracks:
- ✅ Successfully scheduled courses
- ❌ Unscheduled courses
- ⚠️ Constraint violations
- 📊 Algorithm convergence time
- 🎯 Solution quality score

---

## 📚 Usage Guide

### Step 1: Setup Base Data

#### Add Student Groups
1. Navigate to **Dashboard** → **Groups**
2. Click **"Add Group"**
3. Enter group name and student count
4. Click **"Save"**

#### Add Teachers
1. Go to **Dashboard** → **Teachers**
2. Click **"Add Teacher"**
3. Fill in: Name, Email, Availability
4. Click **"Save"**

#### Add Classrooms
1. Navigate to **Dashboard** → **Rooms**
2. Click **"Add Room"**
3. Specify:
   - Room name
   - Capacity
   - Room type (Lab, Lecture, Seminar, etc.)
   - Equipment available
4. Click **"Save"**

#### Add Courses
1. Go to **Dashboard** → **Courses**
2. Click **"Add Course"**
3. Fill in:
   - Course name
   - Teacher assignment
   - Student group
   - Minimum capacity needed
   - Preferred room type
   - Duration (in minutes)
4. Click **"Save"**

### Step 2: Generate Optimized Schedule

1. **Go to Dashboard**
2. **Click "🚀 Generate Optimized Schedule"** button
3. **Monitor progress**:
   - Algorithm displays current temperature
   - Real-time constraint satisfaction status
   - Estimated remaining time
4. **View Results**:
   - Success rate displayed
   - Schedule visualization
   - Conflict report (if any)

### Step 3: Review & Export

1. **Dashboard** → **Schedule**
2. **Filter** by day, group, or teacher
3. **Export** options:
   - 📋 CSV format (for spreadsheets)
   - 📅 ICS format (for calendar apps)
   - 🖨️ PDF format (for printing)

---

## 🔧 Advanced Configuration

### Modifying SA Parameters

Edit `src/lib/optimization.ts`:

```typescript
export const SA_CONFIG = {
  initialTemp: 1500,        // Higher = more exploration
  coolingRate: 0.98,        // Lower = slower cooling = better quality
  minTemp: 0.001,           // When to stop
  maxIterations: 200,       // Iterations per temperature level
  weights: {
    conflicts: 100,        // Heavily penalize conflicts
    capacity: 50,          // Moderate capacity issues
    roomType: 20,          // Light room type mismatches
  }
};
```

### Performance Tuning

**For speed (quick schedules):**
```typescript
initialTemp: 100, coolingRate: 0.95, maxIterations: 20
```

**For quality (optimal schedules):**
```typescript
initialTemp: 2000, coolingRate: 0.999, maxIterations: 500
```

---

## 🚀 Future Enhancements

- [ ] **Multiple optimization algorithms**:
  - Genetic Algorithm (GA)
  - Ant Colony Optimization (ACO)
  - Particle Swarm Optimization (PSO)
  
- [ ] **Advanced constraints**:
  - Teacher availability windows
  - Room preparation time
  - Student lab group preferences
  - Lunch break timings
  
- [ ] **Enhanced features**:
  - Export to ICS/PDF/Excel
  - Multi-language support (EN, FR, AR)
  - Dark mode toggle
  - Real-time conflict resolution UI
  - Analytics dashboard with KPIs
  
- [ ] **Scalability**:
  - PostgreSQL support
  - Horizontal scaling capabilities
  - Caching layer (Redis)
  - Batch schedule generation

- [ ] **Integration**:
  - LDAP/Active Directory authentication
  - Calendar sync (Google Calendar, Outlook)
  - Email notifications
  - Mobile app

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm start
```

---

## 📖 Documentation

### Key Files

- **Algorithm Implementation**: `src/lib/optimization.ts`
- **Database Layer**: `src/lib/db.ts`
- **API Routes**: `src/app/api/`
- **React Components**: `src/components/`
- **Database Seed**: `scripts/seed-database.ts`

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Simulated Annealing Overview](https://en.wikipedia.org/wiki/Simulated_annealing)
- [Timetabling Problem Survey](https://link.springer.com/article/10.1007/s10732-005-6914-1)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

### Getting Help

- 📧 **Email**: hamzaODprogramer@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/hamzaODprogramer/time-management-optimization-metaheuristic-nextjs/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/hamzaODprogramer/time-management-optimization-metaheuristic-nextjs/discussions)

### Report a Bug

Found a bug? Please create an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

<div align="center">

**Made with ❤️ by [hamzaODprogramer](https://github.com/hamzaODprogramer)**

[⬆ Back to top](#-time-management-optimization-system)

</div>
