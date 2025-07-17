#!/bin/bash

echo "🚀 Deploying services with CORS support..."

# Navigate to terraform directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/../../terraform/environments/dev"

# Check if terraform state exists
if [ ! -f "terraform.tfstate" ]; then
  echo "❌ Error: No Terraform state found. Run terraform apply first."
  exit 1
fi

echo "📦 Building and deploying services with CORS support..."

# Apply terraform to rebuild and deploy services
terraform apply -auto-approve

if [ $? -eq 0 ]; then
  echo "✅ Services deployed successfully with CORS support!"
  echo ""
  echo "📊 Updated Infrastructure:"
  terraform output
  echo ""
  echo "🔧 CORS Configuration:"
  echo "  - Pet Service: FastAPI CORS middleware enabled"
  echo "  - Food Service: Express.js CORS configured for localhost"
  echo "  - ALB: No changes needed (CORS handled at application level)"
  echo ""
  echo "🌐 You can now test the real API endpoints:"
  ALB_DNS=$(terraform output -raw alb_dns_name)
  echo "  - Pets: http://$ALB_DNS/petstore/pets"
  echo "  - Foods: http://$ALB_DNS/petstore/foods"
  echo ""
  echo "🎯 Next: Run sync-config.sh and restart your UI app to test the real API"
else
  echo "❌ Deployment failed. Check the logs above."
  exit 1
fi