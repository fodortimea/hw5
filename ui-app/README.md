# Pet Store Mobile App

A React Native mobile application built with Expo that connects to the Pet Store microservices architecture deployed on AWS.

## 🏗️ Architecture Overview

This mobile app serves as the frontend client for the Pet Store microservices, featuring:

- **Cross-platform**: Runs on iOS, Android, and Web
- **AWS Integration**: Connects to API Gateway and microservices via Cognito JWT authentication
- **Dual Access Mode**: Supports both authenticated (API Gateway) and direct (ALB) access
- **Real-time Data**: CRUD operations for pets and food inventory management

## 📋 Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** package manager
3. **Expo CLI** (will be installed automatically)
4. **AWS Infrastructure**: The Pet Store backend must be deployed via Terraform
5. **Mobile Device/Emulator** (optional): For testing on mobile devices

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
# Navigate to the ui-app directory
cd ui-app

# Install all required packages
npm install
```

### Step 2: Sync Configuration from Terraform

**IMPORTANT**: This step is required before running the app for the first time and after any infrastructure changes.

```bash
# Run the configuration sync script
./scripts/sync-config.sh
```

This script will:
- Extract API endpoints from your Terraform deployment
- Pull Cognito User Pool configuration
- Generate `.env.local` and `app.config.js` files
- Configure the app to connect to your AWS infrastructure

**Expected output:**
```
🔄 Syncing configuration from Terraform...
📡 Reading Terraform outputs...
📝 Creating .env.local file...
⚙️  Updating app.config.js...
✅ Configuration sync complete!
📊 Configuration Summary:
  API Gateway URL: https://your-api-gateway-url.amazonaws.com/dev
  ALB URL: http://your-alb-url.elb.amazonaws.com
  Cognito User Pool: eu-west-1_YourPoolId
  Cognito Client: your-client-id

🚀 You can now run: expo start
```

### Step 3: Launch the Application

```bash
# Start the Expo development server
npx expo start
```

**Choose your platform:**
- **Web**: Press `w` to open in browser (recommended for development)
- **iOS**: Press `i` to open iOS simulator (requires Xcode)
- **Android**: Press `a` to open Android emulator (requires Android Studio)
- **Physical Device**: Scan the QR code with Expo Go app

### Step 4: Testing the User Input Forms

1. **Login**: Use "Development Mode (Recommended)" to skip authentication
2. **Add Pets**: Click "Add Pet" button and fill in the form with your own data
3. **Add Foods**: Click "Add Food" button and test the category selection
4. **Test Persistence**: Refresh the page to verify data persists
5. **Test Validation**: Try submitting empty forms to see validation errors

## 🔐 Authentication Options

The app supports two authentication modes:

### Option 1: Cognito Authentication (Recommended)
1. Use your AWS Cognito user credentials
2. Full JWT-based authentication
3. All API requests go through API Gateway

### Option 2: Development Mode (Direct ALB)
1. Tap "Development Mode (Skip Auth)" on login screen
2. Bypasses Cognito authentication
3. Connects directly to Application Load Balancer
4. **Use only for development/testing**

## 📱 App Features

### Core Functionality
- **Pet Management**: View, create, edit, and delete pets with custom user input forms
- **Food Inventory**: Manage pet food products with stock tracking and category selection
- **User Profile**: View account info and manage authentication
- **Data Persistence**: All user data persists across app sessions and page refreshes

### User Input Forms
- **Pet Form**: Add pets with name, breed, age, and owner information
- **Food Form**: Add foods with name, brand, price, stock, category, and description
- **Form Validation**: Required field validation with clear error messages
- **Category Selection**: Interactive category buttons for food items (dog, cat, bird, fish, other)
- **Modal Interface**: Clean, responsive modal forms with animations

### Navigation
- **Bottom Tabs**: Quick access to Pets, Foods, and Profile
- **Modal Forms**: Smooth modal animations for adding new items
- **Real-time Updates**: Changes reflect immediately after form submission

### Development Features
- **CORS Bypass**: Simulated API for web development (bypasses CORS restrictions)
- **localStorage Persistence**: Data survives browser refreshes during development
- **Dual API Mode**: Ready for real AWS API integration on mobile devices
- **Error Handling**: User-friendly error messages and retry options
- **Loading States**: Visual feedback during form submission and API operations

## 🛠️ Development Workflow

### After Infrastructure Changes

When you update your Terraform infrastructure:

```bash
# 1. Apply Terraform changes
cd ../terraform/environments/dev
terraform apply

# 2. Sync new configuration
cd ../../ui-app
./scripts/sync-config.sh

# 3. Restart the app (if running)
# Press 'r' in the Expo terminal to reload
```

### Testing Different Environments

```bash
# Development environment (default)
./scripts/sync-config.sh

# For other environments, modify the script to point to different Terraform directories
```

### Debugging Connection Issues

1. **Check Infrastructure**: Ensure your AWS infrastructure is running
   ```bash
   cd ../terraform/environments/dev
   terraform output
   ```

2. **Verify Configuration**: Check generated config files
   ```bash
   cat .env.local
   cat app.config.js
   ```

3. **Test Direct ALB Access**: Use development mode to bypass authentication

4. **Check Network**: Ensure your device/emulator has internet access

## 📁 Project Structure

```
ui-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Application screens
│   │   ├── auth/           # Login and authentication
│   │   ├── pets/           # Pet management screens
│   │   ├── foods/          # Food management screens
│   │   └── profile/        # User profile screens
│   ├── services/           # API integration layer
│   │   ├── api.js          # Base API configuration
│   │   ├── auth.js         # Cognito authentication
│   │   ├── pets.js         # Pet CRUD operations
│   │   └── foods.js        # Food CRUD operations
│   ├── context/            # React Context for state management
│   ├── navigation/         # App navigation configuration
│   ├── utils/              # Utility functions and constants
│   └── styles/             # Styling and theming
├── scripts/
│   └── sync-config.sh      # Terraform configuration sync
├── assets/                 # Images, icons, fonts
├── .env.local             # Generated environment variables
├── app.config.js          # Generated Expo configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Configuration Files

### `.env.local` (Auto-generated)
Contains environment variables pulled from Terraform:
```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/dev
EXPO_PUBLIC_ALB_BASE_URL=http://your-alb-url.elb.amazonaws.com
EXPO_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_YourPoolId
EXPO_PUBLIC_COGNITO_CLIENT_ID=your-client-id
EXPO_PUBLIC_COGNITO_REGION=us-east-1
EXPO_PUBLIC_ENVIRONMENT=development
```

### `app.config.js` (Auto-generated)
Expo configuration that includes the environment variables in the app bundle.

**⚠️ Important**: Do not edit these files manually. They are auto-generated by the sync script.

## 🐛 Troubleshooting

### Common Issues

1. **"API configuration not found" Error**
   ```bash
   # Solution: Run the sync script
   ./scripts/sync-config.sh
   ```

2. **"Failed to load pets/foods" Error**
   - Check if your AWS infrastructure is running
   - Try switching to Development Mode
   - Verify network connectivity

3. **Cognito Authentication Fails**
   - Check Cognito User Pool exists in AWS Console
   - Try Development Mode as fallback
   - Verify user credentials

4. **App Won't Start**
   ```bash
   # Clear Expo cache
   npx expo start --clear
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Configuration Sync Fails**
   - Ensure you're in the correct directory
   - Check that Terraform state exists
   - Verify AWS CLI access

### Network Debugging

```bash
# Test API Gateway directly
curl https://your-api-gateway-url.amazonaws.com/dev/petstore/pets

# Test ALB directly
curl http://your-alb-url.elb.amazonaws.com/petstore/pets

# Check Cognito configuration
aws cognito-idp describe-user-pool --user-pool-id your-pool-id
```

## 📚 Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Documentation**: https://reactnative.dev/
- **AWS Cognito Guide**: https://docs.aws.amazon.com/cognito/
- **Terraform Pet Store Architecture**: See `../terraform/README.md`

## 🚢 Deployment

### Development Testing
The app runs in development mode with hot reloading enabled.

### Production Build
```bash
# Web deployment
npx expo export --platform web
# Output will be in `dist/` directory

# Mobile app build (requires EAS CLI)
npx expo install @expo/cli
npx expo build:ios    # iOS App Store
npx expo build:android # Google Play Store
```

## 🤝 Development Notes

### Phase 1 (✅ COMPLETED)
✅ Basic authentication and navigation
✅ CRUD operations for pets and foods
✅ Terraform integration
✅ Dual authentication modes
✅ User input forms with validation
✅ Data persistence with localStorage
✅ CORS bypass for web development
✅ Category selection for food items

### Phase 2 (Next)
- Pet/food detail screens with edit capabilities
- Image upload capabilities
- Advanced search and filtering

### Phase 3 (Future)
- Advanced filtering and search
- Category management
- Stock alerts

### Phase 4 (Future)
- Offline support
- Push notifications
- Analytics dashboard

---

## 🎯 Quick Commands Reference

```bash
# Essential commands
./scripts/sync-config.sh    # Sync configuration from Terraform
npx expo start              # Start development server
npx expo start --web        # Start web-only mode
npx expo start --clear      # Clear cache and start

# Development shortcuts
# (Run these in the Expo terminal after starting)
w    # Open web browser
i    # Open iOS simulator
a    # Open Android emulator
r    # Reload app
```

**Happy coding! 🚀**