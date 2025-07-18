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

#### Configuration Sync Script

```bash
# scripts/sync-config.sh
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



# After infrastructure changes

cd ../terraform
terraform apply -variables
cd ../../ui-app
./scripts/sync-config.sh

# Start development

```bash
expo start
```

## **Script Usage:**

```bash
# Sync configuration from Terraform
./scripts/sync-config.sh

# Start mobile development
./scripts/run-mobile.sh

# Fix dependency issues (if needed)
./scripts/fix-dependencies.sh
```

The UI application will serve as the primary interface for users to manage pets and foods, providing a modern, responsive, and secure experience that leverages the existing microservices infrastructure.