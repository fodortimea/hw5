#!/bin/bash

# Setup script for Terraform remote state storage
# This creates the S3 bucket and DynamoDB table needed for remote state

set -e

# Configuration
REGION="eu-west-1"
DEV_BUCKET="petstore-terraform-state-dev"
PROD_BUCKET="petstore-terraform-state-prod"
DYNAMODB_TABLE="petstore-terraform-locks"

echo "🚀 Setting up Terraform remote state storage..."
echo "Region: $REGION"
echo ""

# Function to create S3 bucket
create_s3_bucket() {
    local bucket_name=$1
    local env_name=$2
    
    echo "📦 Creating S3 bucket: $bucket_name"
    
    # Check if bucket already exists
    if aws s3api head-bucket --bucket $bucket_name 2>/dev/null; then
        echo "⚠️  Bucket $bucket_name already exists, skipping creation"
        return 0
    fi
    
    # Create bucket
    aws s3api create-bucket \
        --bucket $bucket_name \
        --region $REGION \
        --create-bucket-configuration LocationConstraint=$REGION
    
    # Enable versioning (important for state files!)
    aws s3api put-bucket-versioning \
        --bucket $bucket_name \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket $bucket_name \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    
    # Block public access (security best practice)
    aws s3api put-public-access-block \
        --bucket $bucket_name \
        --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
    
    echo "✅ $env_name bucket created successfully"
    echo ""
}

# Function to create DynamoDB table for state locking
create_dynamodb_table() {
    echo "🔐 Creating DynamoDB table for state locking: $DYNAMODB_TABLE"
    
    # Check if table already exists
    if aws dynamodb describe-table --table-name $DYNAMODB_TABLE --region $REGION &>/dev/null; then
        echo "⚠️  DynamoDB table $DYNAMODB_TABLE already exists, skipping creation"
        return 0
    fi
    
    aws dynamodb create-table \
        --table-name $DYNAMODB_TABLE \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region $REGION
    
    # Wait for table to be created
    echo "⏳ Waiting for DynamoDB table to be created..."
    aws dynamodb wait table-exists --table-name $DYNAMODB_TABLE --region $REGION
    
    echo "✅ DynamoDB table created successfully"
    echo ""
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "🔍 Checking current AWS identity..."
aws sts get-caller-identity
echo ""

# Create S3 buckets
create_s3_bucket $DEV_BUCKET "Development"
create_s3_bucket $PROD_BUCKET "Production"

# Create DynamoDB table
create_dynamodb_table

echo "🎉 Remote state setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Navigate to your terraform directory: cd terraform"
echo "2. Run 'terraform init' to migrate to remote state"
echo "3. When prompted, type 'yes' to copy existing state to remote backend"
echo ""
echo "🔗 Backend configuration:"
echo "- Development bucket: $DEV_BUCKET"
echo "- Production bucket: $PROD_BUCKET"
echo "- DynamoDB table: $DYNAMODB_TABLE"
echo "- Region: $REGION"
echo ""
echo "⚠️  Important: Never delete these resources manually!"
echo "   They contain your infrastructure state information."
echo ""
echo "🔧 To customize bucket names, edit the variables at the top of this script"