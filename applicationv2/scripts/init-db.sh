#!/bin/bash
# Initialize database with seed data

echo "Initializing Student Schedule Manager database..."

# Check if ts-node is available
if ! command -v npx &> /dev/null; then
    echo "Error: Node.js and npm are required"
    exit 1
fi

# Run the seed script
npx ts-node scripts/seed-database.ts

if [ $? -eq 0 ]; then
    echo "Database initialization complete!"
    echo "You can now start the application with: npm run dev"
else
    echo "Database initialization failed"
    exit 1
fi
