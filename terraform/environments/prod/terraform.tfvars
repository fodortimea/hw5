# AWS Configuration
aws_region = "eu-west-1"

# Project Configuration
project_name = "pet-store"
environment  = "prod"

# VPC Configuration
vpc_cidr           = "10.1.0.0/16"  # Different CIDR for prod
availability_zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]  # All 3 AZs for prod
enable_nat_gateway = true
single_nat_gateway = false  # Multi-AZ NAT for production

# Cognito Configuration
cognito_domain_prefix = "petstore-auth-prod"
create_test_user     = false  # No test user in production

# ECR Configuration
ecr_repositories = [
  {
    name                 = "pet-service"
    image_tag_mutability = "IMMUTABLE"  # Immutable for prod
    scan_on_push         = true
  },
  {
    name                 = "food-service"
    image_tag_mutability = "IMMUTABLE"  # Immutable for prod
    scan_on_push         = true
  }
]
enable_ecr_lifecycle_policy        = true
ecr_untagged_image_expiration_days = 1
ecr_tagged_image_count_limit       = 20  # More images for prod
enable_ecr_encryption              = true
ecr_encryption_type                = "AES256"

# Database Configuration
database_name                    = "petstore"
database_username               = "petstore_admin"
# database_password will be auto-generated and stored in Secrets Manager
database_instance_class         = "db.t3.small"  # Larger instance for prod
database_allocated_storage      = 100  # More storage for prod
database_backup_retention_period = 30  # Longer retention for prod
database_multi_az               = true  # Multi-AZ for production
database_storage_encrypted      = true
database_deletion_protection    = true  # Protect production database
database_skip_final_snapshot    = false  # Take final snapshot in prod

# ECS Configuration
pet_service_image_uri      = "869935088019.dkr.ecr.eu-west-1.amazonaws.com/pet-store-dev-pet-service:latest"  # Will be set after ECR push
pet_service_cpu           = 512  # More CPU for prod
pet_service_memory        = 1024  # More memory for prod
pet_service_desired_count = 2  # Multiple instances for prod
pet_service_port          = 8000

food_service_image_uri     = "869935088019.dkr.ecr.eu-west-1.amazonaws.com/pet-store-dev-food-service:latest"  # Will be set after ECR push
food_service_cpu          = 512  # More CPU for prod
food_service_memory       = 1024  # More memory for prod
food_service_desired_count = 2  # Multiple instances for prod
food_service_port         = 8001

# Logging Configuration
enable_ecs_logging = true
enable_api_logging = true
log_retention_in_days = 30  # Longer retention for prod

# Auto Scaling Configuration
enable_auto_scaling = true
auto_scaling_config = {
  min_capacity = 2
  max_capacity = 10
  target_cpu   = 60
}

# API Gateway Configuration
api_gateway_stage_name = "prod"
enable_api_key        = true  # Enable API key for prod
enable_api_throttling = true
api_throttle_settings = {
  rate_limit  = 5000   # Higher limits for prod
  burst_limit = 10000
}

# CORS Configuration - Restrict origins in production
enable_cors = true
cors_configuration = {
  allow_credentials = true
  allow_headers     = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
  allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allow_origins     = ["https://petstore.yourdomain.com", "https://app.petstore.yourdomain.com"]  # Specific origins for prod
  expose_headers    = []
  max_age          = 86400
}