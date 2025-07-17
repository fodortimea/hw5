# Pet Store UI Application - Implementation Plan

## Architecture Analysis

Based on the architecture diagram, the UI application is a **mobile/web client** that communicates with the backend microservices through:
- **API Gateway** for routing requests
- **Cognito** for JWT-based authentication  
- Two main endpoints: `/petstore/pets` and `/petstore/foods`

## Technology Stack Decision

### Frontend Framework: **React Native with Expo**
**Rationale:**
- **Cross-platform**: Single codebase for iOS, Android, and Web
- **Fast development**: Expo provides rapid prototyping and deployment
- **Architecture alignment**: Supports the mobile app shown in the diagram
- **JWT integration**: Easy authentication with AWS Cognito
- **API consumption**: Excellent REST API integration capabilities

### State Management: **React Context + Hooks**
- Simple, built-in state management
- Suitable for CRUD operations with pets and foods
- Easy authentication state handling

### HTTP Client: **Axios**
- Clean API integration with interceptors for JWT tokens
- Error handling for failed requests
- Request/response transformation

## Application Features & Implementation Plan

### Phase 1: Core Authentication & Navigation
```
├── Authentication System
│   ├── Login screen with Cognito integration
│   ├── JWT token management
│   ├── Automatic token refresh
│   └── Logout functionality
├── Navigation Structure
│   ├── Bottom tab navigation (Pets | Foods | Profile)
│   ├── Stack navigation for detail screens
│   └── Auth guard for protected routes
└── Base UI Components
    ├── Custom buttons, inputs, cards
    ├── Loading states and error handling
    └── Consistent styling system
```

### Phase 2: Pet Management Module
```
├── Pet List Screen
│   ├── Display all pets from GET /petstore/pets
│   ├── Search and filter functionality
│   ├── Pull-to-refresh capability
│   └── Add new pet button
├── Pet Detail Screen
│   ├── View individual pet information
│   ├── Edit pet details (PUT /petstore/pets/{id})
│   ├── Delete pet option (DELETE /petstore/pets/{id})
│   └── Owner information display
└── Add/Edit Pet Screen
    ├── Form with validation (name, breed, age, owner)
    ├── Create new pet (POST /petstore/pets)
    ├── Update existing pet
    └── Image upload capability (future enhancement)
```

### Phase 3: Food Management Module
```
├── Food List Screen
│   ├── Display all foods from GET /petstore/foods
│   ├── Category filtering (dog, cat, etc.)
│   ├── Stock level indicators
│   └── Add new food button
├── Food Detail Screen
│   ├── View food information (brand, price, stock)
│   ├── Edit food details (PUT /petstore/foods/{id})
│   ├── Delete food option (DELETE /petstore/foods/{id})
│   └── Stock management
└── Add/Edit Food Screen
    ├── Form with validation (name, brand, price, stock, category)
    ├── Create new food (POST /petstore/foods)
    ├── Update existing food
    └── Price formatting and stock management
```

### Phase 4: Enhanced Features
```
├── Dashboard/Home Screen
│   ├── Quick stats (total pets, low stock foods)
│   ├── Recent activities
│   └── Quick action buttons
├── Search & Filter
│   ├── Global search across pets and foods
│   ├── Advanced filtering options
│   └── Sort capabilities
├── Offline Support
│   ├── Local data caching
│   ├── Offline indicators
│   └── Sync when online
└── User Profile
    ├── User information from Cognito
    ├── App settings
    └── Logout functionality
```

## Technical Implementation Details

### Project Structure
```
ui-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Buttons, inputs, cards
│   │   ├── pets/           # Pet-specific components
│   │   └── foods/          # Food-specific components
│   ├── screens/            # Application screens
│   │   ├── auth/           # Login, signup screens
│   │   ├── pets/           # Pet management screens
│   │   ├── foods/          # Food management screens
│   │   └── profile/        # User profile screens
│   ├── services/           # API and business logic
│   │   ├── api.js          # API configuration and interceptors
│   │   ├── auth.js         # Cognito authentication
│   │   ├── pets.js         # Pet CRUD operations
│   │   └── foods.js        # Food CRUD operations
│   ├── context/            # React Context for state management
│   │   ├── AuthContext.js  # Authentication state
│   │   ├── PetsContext.js  # Pet data state
│   │   └── FoodsContext.js # Food data state
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js # Main navigation structure
│   │   └── AuthNavigator.js# Authentication flow navigation
│   ├── utils/              # Utility functions
│   │   ├── constants.js    # API endpoints, colors
│   │   ├── helpers.js      # Common helper functions
│   │   └── validation.js   # Form validation rules
│   └── styles/             # Styling and theming
│       ├── colors.js       # Color palette
│       ├── typography.js   # Font styles
│       └── common.js       # Common styles
├── assets/                 # Images, icons, fonts
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── README.md              # Project documentation
```

### API Integration Strategy

#### Configuration Management - Terraform Integration

**Configuration Sync Script**
```bash
#!/bin/bash
# scripts/sync-config.sh
echo "🔄 Syncing configuration from Terraform..."

# Navigate to terraform directory
cd ../terraform/environments/dev

# Check if terraform state exists
if [ ! -f "terraform.tfstate" ]; then
  echo "❌ Error: No Terraform state found. Run terraform apply first."
  exit 1
fi

# Extract values from terraform outputs
echo "📡 Reading Terraform outputs..."
API_URL=$(terraform output -raw api_gateway_invoke_url)
USER_POOL_ID=$(terraform output -raw cognito_user_pool_id)
CLIENT_ID=$(terraform output -raw cognito_user_pool_client_id)
ALB_DNS=$(terraform output -raw alb_dns_name)

# Validate outputs
if [ -z "$API_URL" ] || [ -z "$USER_POOL_ID" ] || [ -z "$CLIENT_ID" ]; then
  echo "❌ Error: Missing required Terraform outputs"
  echo "API_URL: $API_URL"
  echo "USER_POOL_ID: $USER_POOL_ID"
  echo "CLIENT_ID: $CLIENT_ID"
  exit 1
fi

# Navigate back to ui-app directory
cd ../../ui-app

# Create .env.local file
echo "📝 Creating .env.local file..."
cat > .env.local << EOF
# Auto-generated from Terraform outputs - DO NOT EDIT MANUALLY
# Run ./scripts/sync-config.sh to update

# API Configuration
EXPO_PUBLIC_API_BASE_URL=$API_URL
EXPO_PUBLIC_ALB_BASE_URL=http://$ALB_DNS

# Cognito Configuration
EXPO_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
EXPO_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID
EXPO_PUBLIC_COGNITO_REGION=us-east-1

# Environment
EXPO_PUBLIC_ENVIRONMENT=development
EOF

# Create app.config.js
echo "⚙️  Updating app.config.js..."
cat > app.config.js << EOF
export default {
  expo: {
    name: "Pet Store App",
    slug: "pet-store-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      albBaseUrl: process.env.EXPO_PUBLIC_ALB_BASE_URL,
      cognitoUserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
      cognitoClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
      cognitoRegion: process.env.EXPO_PUBLIC_COGNITO_REGION,
      environment: process.env.EXPO_PUBLIC_ENVIRONMENT
    }
  }
};
EOF

echo "✅ Configuration sync complete!"
echo "📊 Configuration Summary:"
echo "  API Gateway URL: $API_URL"
echo "  ALB URL: http://$ALB_DNS"
echo "  Cognito User Pool: $USER_POOL_ID"
echo "  Cognito Client: $CLIENT_ID"
echo ""
echo "🚀 You can now run: expo start"
```

#### Base API Configuration
```javascript
// services/api.js
import Constants from 'expo-constants';

// Get configuration from environment variables (synced from Terraform)
const config = Constants.expoConfig.extra;

if (!config.apiBaseUrl) {
  throw new Error('API configuration not found. Run ./scripts/sync-config.sh first.');
}

const API_BASE_URL = config.apiBaseUrl;
const ALB_BASE_URL = config.albBaseUrl; // Fallback for testing

console.log('🔗 API Configuration:', {
  apiGateway: API_BASE_URL,
  directALB: ALB_BASE_URL,
  environment: config.environment
});

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// JWT token interceptor
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor for handling auth issues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      AuthContext.signOut();
    }
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL, ALB_BASE_URL };
```

#### Development Workflow
```bash
# Initial setup after cloning
./scripts/sync-config.sh

# After infrastructure changes
cd ../terraform/environments/dev
terraform apply
cd ../../ui-app
./scripts/sync-config.sh

# Start development
expo start
```

#### Service Modules
```javascript
// services/pets.js
export const petsService = {
  getAll: () => apiClient.get('/petstore/pets'),
  getById: (id) => apiClient.get(`/petstore/pets/${id}`),
  create: (petData) => apiClient.post('/petstore/pets', petData),
  update: (id, petData) => apiClient.put(`/petstore/pets/${id}`, petData),
  delete: (id) => apiClient.delete(`/petstore/pets/${id}`)
};

// services/foods.js
export const foodsService = {
  getAll: () => apiClient.get('/petstore/foods'),
  getById: (id) => apiClient.get(`/petstore/foods/${id}`),
  create: (foodData) => apiClient.post('/petstore/foods', foodData),
  update: (id, foodData) => apiClient.put(`/petstore/foods/${id}`, foodData),
  delete: (id) => apiClient.delete(`/petstore/foods/${id}`)
};
```

### Authentication Integration

#### Cognito Configuration
```javascript
// services/auth.js
import { Auth } from 'aws-amplify';
import Constants from 'expo-constants';

// Get Cognito configuration from environment (synced from Terraform)
const config = Constants.expoConfig.extra;

if (!config.cognitoUserPoolId || !config.cognitoClientId) {
  throw new Error('Cognito configuration not found. Run ./scripts/sync-config.sh first.');
}

const authConfig = {
  region: config.cognitoRegion,
  userPoolId: config.cognitoUserPoolId,
  userPoolWebClientId: config.cognitoClientId,
};

// Configure Amplify with dynamic config
Auth.configure(authConfig);

console.log('🔐 Cognito Configuration:', {
  region: authConfig.region,
  userPoolId: authConfig.userPoolId,
  clientId: authConfig.userPoolWebClientId
});

export const authService = {
  signIn: async (username, password) => {
    try {
      const user = await Auth.signIn(username, password);
      console.log('✅ Sign in successful');
      return user;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      await Auth.signOut();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      return await Auth.currentAuthenticatedUser();
    } catch (error) {
      console.log('ℹ️ No authenticated user found');
      return null;
    }
  },
  
  getAccessToken: async () => {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      throw error;
    }
  },
  
  // Helper for testing with manual token (when Cognito has issues)
  getTestToken: async () => {
    // This would call the AWS CLI method or manual user creation
    // Useful during development if Cognito deployment has issues
    console.warn('🧪 Using test token - only for development');
    return 'test-token-for-development';
  }
};
```

## Development Phases & Timeline

### Phase 1: Foundation (Week 1)
- [x] Set up Expo React Native project
- [ ] Configure navigation structure
- [ ] Implement basic authentication with Cognito
- [ ] Create base UI components
- [ ] Set up API service layer

### Phase 2: Pet Management (Week 2)
- [ ] Implement pet list screen with API integration
- [ ] Create pet detail and edit screens
- [ ] Add form validation and error handling
- [ ] Implement CRUD operations for pets

### Phase 3: Food Management (Week 3)
- [ ] Implement food list screen with API integration
- [ ] Create food detail and edit screens
- [ ] Add category filtering and stock management
- [ ] Implement CRUD operations for foods

### Phase 4: Enhancement & Polish (Week 4)
- [ ] Add dashboard/home screen
- [ ] Implement global search functionality
- [ ] Add offline support and caching
- [ ] Performance optimization and testing
- [ ] UI/UX improvements and animations

## Testing Strategy

### Unit Testing
- Component testing with React Native Testing Library
- Service layer testing with Jest
- Authentication flow testing

### Integration Testing
- API integration tests
- Navigation flow tests
- End-to-end critical user journeys

### Manual Testing
- Device testing (iOS/Android/Web)
- Authentication scenarios
- Network connectivity edge cases
- Performance testing with large datasets

## Deployment Strategy

### Development
- Expo Go app for rapid testing
- Over-the-air updates for quick iterations

### Production
- Expo Application Services (EAS) for building
- App Store and Google Play Store distribution
- Web deployment to Netlify/Vercel

## Success Criteria

1. **Functional Requirements**
   - ✅ Complete CRUD operations for pets and foods
   - ✅ Secure authentication with Cognito JWT tokens
   - ✅ Responsive design for mobile and web
   - ✅ Offline capability with data synchronization

2. **Non-Functional Requirements**
   - ✅ App loads within 3 seconds
   - ✅ Smooth animations and transitions
   - ✅ Works on iOS 12+, Android 8+, modern browsers
   - ✅ Handles network errors gracefully

3. **User Experience**
   - ✅ Intuitive navigation and information architecture
   - ✅ Consistent visual design language
   - ✅ Accessible for users with disabilities
   - ✅ Clear feedback for all user actions

## Architecture Alignment

This implementation plan aligns perfectly with the provided architecture diagram:
- **Mobile Client**: React Native app serves as the mobile client
- **API Gateway Integration**: All requests go through the configured API Gateway
- **JWT Authentication**: Cognito integration provides secure token-based auth
- **Microservices Communication**: App consumes both pet and food service endpoints
- **Scalable Design**: Component-based architecture supports future feature additions

The UI application will serve as the primary interface for users to manage pets and foods, providing a modern, responsive, and secure experience that leverages the existing microservices infrastructure.