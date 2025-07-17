#!/bin/bash

echo "🔒 Fixing Critical Security Issue: Hardcoded Database Credentials"
echo "================================================================"
echo ""

# Navigate to terraform directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/../terraform/environments/dev"

echo "Current directory: $(pwd)"
echo ""

echo "📋 Changes Made:"
echo "1. ✅ Removed hardcoded password from terraform.tfvars"
echo "2. ✅ Updated ECS task definitions to use Secrets Manager"
echo "3. ✅ Added IAM policies for Secrets Manager access"
echo "4. ✅ Updated infrastructure to pass secret ARN"
echo ""

echo "🔍 Checking current Terraform state..."
if [ ! -f "terraform.tfstate" ]; then
  echo "❌ Error: No Terraform state found. Infrastructure not deployed yet."
  exit 1
fi

echo ""
echo "📦 Planning infrastructure changes..."
terraform plan -var-file="terraform.tfvars" -out=security-fix.tfplan

if [ $? -ne 0 ]; then
  echo "❌ Terraform plan failed. Please check the configuration."
  exit 1
fi

echo ""
echo "🚀 Applying security fixes..."
read -p "Apply the security fixes? This will update the infrastructure. (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

terraform apply security-fix.tfplan

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Security fixes applied successfully!"
  echo ""
  echo "🔒 Security Improvements:"
  echo "  - Database credentials now generated automatically"
  echo "  - Credentials stored securely in AWS Secrets Manager"
  echo "  - No more hardcoded passwords in version control"
  echo "  - ECS tasks use IAM roles to access secrets"
  echo ""
  echo "📊 Updated Infrastructure:"
  terraform output
  echo ""
  echo "🔧 Next Steps:"
  echo "1. Verify services can connect to database"
  echo "2. Update any local development configurations"
  echo "3. Consider rotating the database password"
  echo ""
  echo "🎯 To verify database connectivity:"
  echo "  aws secretsmanager get-secret-value --secret-id \$(terraform output -raw secrets_manager_secret_arn)"
else
  echo "❌ Failed to apply security fixes. Check the logs above."
  exit 1
fi