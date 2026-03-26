#!/bin/bash

# Start Backend
echo "Starting Backend..."
cd Backend
npm install --production
npm start &
BACKEND_PID=$!

# Start Frontend (Vite will serve the app)
echo "Starting Frontend..."
cd ../Frontend
npm install --production
npm run dev

# Cleanup
trap "kill $BACKEND_PID" EXIT
