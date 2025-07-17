#!/bin/bash

echo "🚀 Starting Expo Development Server for Mobile..."
echo ""

# Navigate to the ui-app directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

# Clear any existing cache
echo "🧹 Clearing Expo cache..."
npx expo r -c

# Start the development server in tunnel mode
echo "📱 Starting development server in tunnel mode..."
echo "   This will create a public URL accessible from your phone"
echo "   Make sure your phone and computer are connected to the internet"
echo ""

# Start with tunnel mode for mobile access
npx expo start --tunnel

echo "📱 Instructions:"
echo "1. Install Expo Go app on your phone"
echo "2. Scan the QR code with your camera (iOS) or Expo Go app (Android)"
echo "3. The app will load on your phone"
echo ""
echo "If you get errors, try:"
echo "- Make sure your phone and computer are connected to the internet"
echo "- Check that no firewall is blocking the connection"
echo "- Try restarting the Expo development server"