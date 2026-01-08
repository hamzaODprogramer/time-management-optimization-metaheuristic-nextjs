# Setup Guide

## Quick Start with MySQL, Prisma & Flask

### Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed
- MySQL server running locally or remote
- MySQL database created

### 1. Clone & Install Dependencies

**Frontend (Next.js):**
\`\`\`bash
npm install
\`\`\`

**Backend (Flask):**
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

### 2. Configure Database Connection

**Frontend - Create `.env.local` in project root:**
\`\`\`env
DATABASE_URL="mysql://user:password@localhost:3306/timetable_db"
SESSION_SECRET="your-super-secret-key-change-in-production"
FLASK_BACKEND_URL="http://localhost:5000"
\`\`\`

**Backend - Create `backend/.env`:**
\`\`\`env
FLASK_ENV=development
FLASK_PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=timetable_db
DB_PORT=3306
\`\`\`

### 3. Initialize Database Schema
\`\`\`bash
# Generate Prisma client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
\`\`\`

### 4. Seed Sample Data (Optional)
\`\`\`bash
npm run db:seed
\`\`\`

This creates sample data:
- 5 student groups (TC S1-S3, Masters 1-2)
- 5 teachers
- 7 rooms (2 amphitheaters, 3 classrooms, 2 labs)
- 30 timeslots (Mon-Fri, 6 slots per day)
- 10 courses
- Admin user: `admin@school.edu` / `admin123`

### 5. Start Development Servers

**Terminal 1 - Flask Backend:**
\`\`\`bash
cd backend
source venv/bin/activate
python app.py
\`\`\`
Flask will run on `http://localhost:5000`

**Terminal 2 - Next.js Frontend:**
\`\`\`bash
npm run dev
\`\`\`
Next.js will run on `http://localhost:3000`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Time Setup

1. **Login or Create Admin Account**
   - Login with: `admin@school.edu` / `admin123` (if seeded)
   - Or sign up with a new email

2. **Add Your Data**
   - Navigate via sidebar to: Groups → Teachers → Rooms → Courses
   - Add your institution's data

3. **Generate Schedule**
   - Go to Dashboard
   - Click "Generate Optimized Schedule"
   - The request will be sent to Flask backend for processing

## Available npm Scripts

\`\`\`bash
npm run dev                # Start Next.js development server
npm run build             # Build for production
npm start                 # Start production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio GUI
npm run db:seed           # Seed database with sample data
\`\`\`

## Flask Backend Commands

\`\`\`bash
cd backend
source venv/bin/activate

python app.py                    # Run Flask development server
python -m pytest                 # Run tests (if configured)
pip freeze > requirements.txt   # Update requirements
\`\`\`

## Database Management

### View Data with Prisma Studio
\`\`\`bash
npm run prisma:studio
\`\`\`
Opens a visual GUI to explore and manage your database.

### Reset Database
\`\`\`bash
npm run prisma:migrate reset
npm run db:seed
\`\`\`

### Create New Migration
After modifying `prisma/schema.prisma`:
\`\`\`bash
npm run prisma:migrate dev --name describe_your_change
\`\`\`

## Environment Variables

**Frontend:**
- `DATABASE_URL` - MySQL connection string
- `SESSION_SECRET` - Session encryption key
- `FLASK_BACKEND_URL` - URL of Flask backend (default: http://localhost:5000)

**Backend:**
- `FLASK_ENV` - Development or production
- `FLASK_PORT` - Flask server port (default: 5000)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` - MySQL credentials

## Architecture

\`\`\`
┌─────────────────┐
│  Next.js App    │
│  (Frontend)     │
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│  Flask Backend  │
│  (Optimization) │
└────────┬────────┘
         │ Database Query
         ▼
    ┌─────────┐
    │  MySQL  │
    └─────────┘
\`\`\`

## Production Deployment

### Frontend (Vercel)
1. **Update Secrets**
   \`\`\`env
   DATABASE_URL="mysql://user:password@prod-host:3306/timetable_db"
   SESSION_SECRET="very-strong-random-secret-key"
   FLASK_BACKEND_URL="https://your-flask-api.com"
   \`\`\`

2. **Deploy**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

### Backend (Python Server/VPS)
1. **Update `.env`**
   \`\`\`env
   FLASK_ENV=production
   FLASK_PORT=5000
   DB_HOST=prod-mysql-host
   DB_USER=prod_user
   DB_PASSWORD=prod_password
   DB_NAME=timetable_db_prod
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Run with Gunicorn**
   \`\`\`bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   \`\`\`

4. **Use Nginx as Reverse Proxy**
   - Forward requests to Flask on port 5000
   - Enable SSL/TLS

## Troubleshooting

### MySQL Connection Error
**Error**: `Can't reach database server at localhost:3306`

**Solutions**:
- Verify MySQL is running: `mysql -u root -p`
- Check DATABASE_URL format is correct
- Ensure firewall allows port 3306

### Flask Backend Not Responding
**Error**: `Failed to optimize schedule. Make sure Flask backend is running`

**Solutions**:
- Verify Flask is running: `python backend/app.py`
- Check Flask backend URL in `.env.local` matches actual URL
- Verify MySQL credentials are correct in `backend/.env`
- Check console for database connection errors

### Prisma Client Generation Error
**Error**: `Cannot find module '@prisma/client'`

**Solutions**:
- Run `npm run prisma:generate`
- Delete `node_modules` and `npm install`

### Python Virtual Environment Issues
**Error**: `No module named 'flask'`

**Solutions**:
- Activate virtual environment: `source venv/bin/activate`
- Reinstall: `pip install -r requirements.txt`
- On Windows: `venv\Scripts\activate`

### Schedule Generation Not Working
- Verify Flask backend is running and accessible
- Check FLASK_BACKEND_URL in `.env.local`
- Verify courses, groups, teachers, rooms exist in database
- Check browser console and server logs for errors

## Support

For issues or questions:
- Check troubleshooting section above
- Review Prisma Docs: https://www.prisma.io/docs/
- Review Flask Docs: https://flask.palletsprojects.com/
- Review MySQL Docs: https://dev.mysql.com/doc/
