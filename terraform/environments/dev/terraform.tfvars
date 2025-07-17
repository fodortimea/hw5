# AWS Configuration
aws_region = "eu-west-1"

# Project Configuration
project_name = "pet-store"
environment  = "dev"

# VPC Configuration
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["eu-west-1a", "eu-west-1b"]
enable_nat_gateway = true
single_nat_gateway = true  # Cost optimization for dev

# Cognito Configuration
cognito_domain_prefix = "petstore-auth-dev-v4"
create_test_user     = true

# ECR Configuration
ecr_repositories = [
  {
    name                 = "pet-service"
    image_tag_mutability = "MUTABLE"
    scan_on_push         = true
  },
  {
    name                 = "food-service"
    image_tag_mutability = "MUTABLE"
    scan_on_push         = true
  }
]
enable_ecr_lifecycle_policy        = true
ecr_untagged_image_expiration_days = 1
ecr_tagged_image_count_limit       = 10
enable_ecr_encryption              = true
ecr_encryption_type                = "AES256"

# Database Configuration
database_name                    = "petstore"
database_username               = "petstore_admin"
# database_password removed for security - using auto-generated password via Secrets Manager
database_instance_class         = "db.t3.micro"
database_allocated_storage      = 20
database_backup_retention_period = 7
database_multi_az               = false  # Cost optimization for dev
database_storage_encrypted      = true
database_deletion_protection    = false  # Easier cleanup for dev
database_skip_final_snapshot    = true

# ECS Configuration - Will be populated after building Docker images
pet_service_image_uri      = ""  # Will be set after ECR push
pet_service_cpu           = 256
pet_service_memory        = 512
pet_service_desired_count = 1
pet_service_port          = 8000

food_service_image_uri     = ""  # Will be set after ECR push
food_service_cpu          = 256
food_service_memory       = 512
food_service_desired_count = 1
food_service_port         = 8001

# Logging Configuration
enable_ecs_logging = true
enable_api_logging = true
log_retention_in_days = 7

# Auto Scaling Configuration (disabled for dev)
enable_auto_scaling = false
auto_scaling_config = {
  min_capacity = 1
  max_capacity = 3
  target_cpu   = 70
}

# API Gateway Configuration
api_gateway_stage_name = "dev"
enable_api_key        = false  # Disabled for dev, only using Cognito
enable_api_throttling = true
api_throttle_settings = {
  rate_limit  = 1000
  burst_limit = 2000
}

# CORS Configuration
enable_cors = true
cors_configuration = {
  allow_credentials = true
  allow_headers     = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
  allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allow_origins     = ["*"]
  expose_headers    = []
  max_age          = 86400
}