#!/bin/bash
# Database seeding script for PovertyLine
# This script provides a convenient way to seed the database with test data

# Set environment variables
export FLASK_APP=app

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

print_help() {
  echo -e "${YELLOW}PovertyLine Database Seeding Script${NC}"
  echo ""
  echo "Usage:"
  echo "  ./seed_db.sh [command]"
  echo ""
  echo "Commands:"
  echo "  seed     Seed the database with test data (default)"
  echo "  unseed   Remove all seeded data"
  echo "  help     Show this help message"
  echo ""
}

# Check if Flask is installed
if ! command -v flask &> /dev/null; then
  echo -e "${RED}Error: Flask command not found.${NC}"
  echo "Make sure you have activated your virtual environment and installed all dependencies."
  echo "Run: pip install -r requirements.txt"
  exit 1
fi

# Process command line arguments
if [ $# -eq 0 ]; then
  # Default action is to seed
  echo -e "${GREEN}Seeding database with test data...${NC}"
  flask seed_db
elif [ "$1" == "seed" ]; then
  echo -e "${GREEN}Seeding database with test data...${NC}"
  flask seed_db
elif [ "$1" == "unseed" ]; then
  echo -e "${YELLOW}Removing all seeded data...${NC}"
  flask unseed_db
elif [ "$1" == "help" ] || [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  print_help
else
  echo -e "${RED}Unknown command: $1${NC}"
  print_help
  exit 1
fi
