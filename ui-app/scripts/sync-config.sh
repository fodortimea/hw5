#!/bin/bash
# scripts/sync-config.sh
echo "🔄 Syncing configuration from Terraform..."

# Get the script directory and navigate to terraform
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_APP_DIR="$(dirname "$SCRIPT_DIR")"
cd "$UI_APP_DIR/../terraform"

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
cd "$UI_APP_DIR"

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
EXPO_PUBLIC_COGNITO_REGION=eu-west-1

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