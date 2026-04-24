#!/bin/bash

echo "========================================"
echo " Employee Onboarding Platform Setup"
echo "========================================"
echo

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js found: $(node --version)"

echo
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo
echo "Starting the development server..."
echo "The application will be available in your browser."
echo
echo "If it doesn't open automatically, visit:"
echo "http://localhost:3000 (or the port shown below)"
echo
echo "Press Ctrl+C to stop the server when done testing."
echo

npm run dev
