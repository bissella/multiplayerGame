#!/bin/bash
set -e

echo "Setting up project with UV..."

# Check if UV is installed
if ! command -v uv &> /dev/null; then
    echo "UV is not installed. Installing UV..."
    # Using the direct install command instead of the curl method
    pip install uv
fi

# Verify UV installation
uv --version || echo "UV installation failed. Please install manually with 'pip install uv'"

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo "Setup complete! Your environment is ready."
echo "To activate the virtual environment, run: source venv/bin/activate"
