#!/bin/bash

# FocusFlow Vercel Deployment Script
# This script helps you deploy FocusFlow to Vercel

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI is not installed.${NC}"
    echo -e "Please install it with: ${YELLOW}npm install -g vercel${NC}"
    exit 1
fi

echo -e "${GREEN}=== FocusFlow Vercel Deployment ===${NC}"
echo -e "This script will deploy FocusFlow to Vercel."

# Check if user is logged in to Vercel
echo -e "\n${YELLOW}Checking Vercel login status...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "You are not logged in to Vercel. Let's log in first."
    vercel login
fi

# Check for environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}No .env.local file found.${NC}"
    echo -e "Creating one from .env.example..."
    cp .env.example .env.local
    echo -e "${YELLOW}Please edit .env.local to add your API keys before deploying.${NC}"
    read -p "Press Enter to continue after editing .env.local, or Ctrl+C to cancel..."
fi

# Ask for deployment type
echo -e "\n${YELLOW}Select deployment type:${NC}"
echo "1) Development (Preview)"
echo "2) Production"
read -p "Enter your choice (1/2): " deployment_choice

# Deploy based on choice
if [ "$deployment_choice" = "1" ]; then
    echo -e "\n${GREEN}Deploying to development environment...${NC}"
    vercel
elif [ "$deployment_choice" = "2" ]; then
    echo -e "\n${GREEN}Deploying to production environment...${NC}"
    vercel --prod
else
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
fi

echo -e "\n${GREEN}Deployment complete!${NC}"
echo -e "Don't forget to set up your environment variables in the Vercel dashboard."
echo -e "For monitoring setup, refer to the README.md or docs/deployment-guide.md"