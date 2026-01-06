# Timetable Optimization Backend

Flask-based backend service for running the timetable optimization algorithm.

## Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Update .env with your MySQL credentials
```

4. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Health status check

### Optimization
- **POST** `/api/optimize` - Run timetable optimization algorithm

Response format:
```json
{
  "success": true,
  "message": "Successfully scheduled X courses out of Y",
  "scheduleCount": X
}
```

## Environment Variables

- `FLASK_ENV` - Development or production mode
- `FLASK_PORT` - Port to run Flask server (default: 5000)
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL user
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `DB_PORT` - MySQL port (default: 3306)
