#!/bin/bash

echo "🔧 Fixing Dependencies for Mobile Compatibility"
echo "============================================="
echo ""

# Navigate to the ui-app directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

echo "Current directory: $(pwd)"
echo ""

echo "This script will:"
echo "1. Backup current package.json"
echo "2. Use stable/compatible dependencies"
echo "3. Clear cache and reinstall"
echo ""

read -p "Do you want to continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "📦 Backing up current package.json..."
cp package.json package.json.backup

echo "📦 Using stable dependencies..."
cp package.stable.json package.json

echo "🧹 Clearing npm cache..."
npm cache clean --force

echo "🗑️ Removing node_modules..."
rm -rf node_modules

echo "🗑️ Removing package-lock.json..."
rm -f package-lock.json

echo "📦 Installing stable dependencies..."
npm install

echo ""
echo "✅ Dependencies updated!"
echo ""
echo "📱 To test the app:"
echo "1. Run: npx expo start --tunnel"
echo "2. Scan QR code with your phone"
echo ""
echo "📋 If you want to revert:"
echo "1. cp package.json.backup package.json"
echo "2. npm install"