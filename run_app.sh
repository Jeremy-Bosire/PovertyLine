#!/bin/bash
# Script to run both backend and frontend for PovertyLine

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if required commands exist
if ! command_exists python; then
  echo -e "${YELLOW}Warning: Python not found. Backend may not run properly.${NC}"
fi

if ! command_exists npm; then
  echo -e "${YELLOW}Warning: npm not found. Frontend may not run properly.${NC}"
fi

# Function to stop servers on script exit
cleanup() {
  echo -e "\n${YELLOW}Stopping servers...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd "$(dirname "$0")/backend"

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
  echo -e "${BLUE}Activating virtual environment...${NC}"
  source venv/bin/activate
else
  echo -e "${YELLOW}Virtual environment not found. Using system Python.${NC}"
  echo -e "${YELLOW}It's recommended to create a virtual environment:${NC}"
  echo -e "${YELLOW}  python -m venv venv${NC}"
  echo -e "${YELLOW}  source venv/bin/activate${NC}"
  echo -e "${YELLOW}  pip install -r requirements.txt${NC}"
fi

# Set Flask environment variables
export FLASK_APP=app
export FLASK_ENV=development

# Check if database needs to be set up
if [ ! -d "migrations/versions" ] || [ -z "$(ls -A migrations/versions)" ]; then
  echo -e "${BLUE}Setting up database...${NC}"
  flask db upgrade
fi

# Ask if user wants to seed the database
echo -e "${YELLOW}Do you want to seed the database with test data? (y/n)${NC}"
read -r seed_db
if [[ $seed_db == "y" || $seed_db == "Y" ]]; then
  echo -e "${BLUE}Seeding database...${NC}"
  flask seed_db
fi

# Start Flask server in the background
echo -e "${BLUE}Starting Flask server...${NC}"
flask run &
BACKEND_PID=$!

# Start frontend server
echo -e "\n${GREEN}Starting frontend server...${NC}"
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  npm install
fi

# Start React server in the background
echo -e "${BLUE}Starting React server...${NC}"
npm start &
FRONTEND_PID=$!

# Wait for both processes
echo -e "\n${GREEN}Both servers are running!${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:5000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Keep script running until user presses Ctrl+C
wait
