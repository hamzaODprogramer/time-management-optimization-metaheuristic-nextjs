# Student Schedule Manager

A modern, AI-powered timetable management system built with Next.js that optimizes class scheduling for educational institutions.

## Features

- **Authentication**: Secure login/signup system with session management
- **Dashboard**: Overview of system statistics and quick actions
- **Schedule Management**: 
  - View optimized weekly timetable
  - Group and room assignment visualization
  - Conflict detection
- **Data Management**: 
  - Manage student groups
  - Manage teaching staff
  - Manage classrooms and facilities
  - Manage courses and classes
- **Optimization Algorithm**: Intelligent scheduling algorithm that:
  - Respects room capacity requirements
  - Honors preferred room types
  - Avoids scheduling conflicts
  - Maximizes resource utilization

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Cookie-based sessions with password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Initialize the database with sample data:
```bash
npx ts-node scripts/seed-database.ts
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Login

1. Click "Sign up" on the login page
2. Create an admin account with your email and password
3. You'll be redirected to the dashboard

## Database Schema

### Tables

- **users**: System admin accounts
- **groups**: Student groups/classes
- **teachers**: Teaching staff
- **rooms**: Physical classrooms and facilities
- **timeslots**: Available time periods
- **courses**: Classes that need to be scheduled
- **schedule**: Generated schedule assignments

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/session` - Check current session
- `POST /api/auth/logout` - Logout

### Data Management
- `GET/POST /api/groups` - Group management
- `GET/POST /api/teachers` - Teacher management
- `GET/POST /api/rooms` - Room management
- `GET/POST /api/courses` - Course management

### Schedule
- `POST /api/optimize` - Generate optimized schedule
- `GET /api/schedule` - View current schedule

### System
- `GET /api/health` - Health check
- `GET /api/stats` - System statistics
- `POST /api/init` - Initialize database

## Usage

### Adding Data

1. **Groups**: Dashboard → Groups → Add Group
2. **Teachers**: Dashboard → Teachers → Add Teacher
3. **Rooms**: Dashboard → Rooms → Add Room
4. **Courses**: Dashboard → Courses → Add Course

### Generating Schedule

1. Go to Dashboard
2. Click "Generate Optimized Schedule"
3. The algorithm will assign all courses to available timeslots and rooms
4. View the generated schedule in Dashboard → Schedule

## Configuration

Environment variables (optional):
- `DATABASE_PATH`: Path to SQLite database file (default: `./data.db`)
- `SESSION_SECRET`: Session encryption secret (default: `dev-secret-key`)

## Optimization Algorithm

The scheduling algorithm uses a greedy assignment approach:

1. **Sorts courses** by minimum capacity (largest first)
2. **For each course**:
   - Finds available timeslots across the week
   - For each timeslot, finds suitable rooms that:
     - Meet minimum capacity requirements
     - Match preferred room type (if specified)
     - Are not already occupied
3. **Assigns** the course to the first available compatible slot
4. **Reports** scheduling success rate

## Future Enhancements

- Advanced constraint handling (teacher availability, preferred time windows)
- Multiple optimization algorithms (genetic algorithm, simulated annealing)
- Export schedule to ICS/PDF formats
- Multi-language support
- Dark mode toggle
- Schedule conflict resolution UI
- Analytics and reporting

## License

MIT

## Support

For issues or feature requests, please contact the development team.
```

```json file="" isHidden
