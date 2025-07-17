variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "pet-store"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# Docker Build Configuration
variable "project_root" {
  description = "Root directory of the project"
  type        = string
  default     = "/Users/timi/projects/aws/hw5"
}

variable "docker_image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "create_dockerfiles" {
  description = "Whether to create Dockerfiles automatically"
  type        = bool
  default     = false
}

variable "cleanup_local_images" {
  description = "Whether to clean up local Docker images after pushing"
  type        = bool
  default     = true
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use single NAT Gateway for cost optimization"
  type        = bool
  default     = true
}

# Cognito Configuration
variable "cognito_domain_prefix" {
  description = "Cognito domain prefix"
  type        = string
  default     = "petstore-auth-dev"
}

variable "cognito_password_policy" {
  description = "Password policy configuration"
  type = object({
    minimum_length    = number
    require_lowercase = bool
    require_numbers   = bool
    require_symbols   = bool
    require_uppercase = bool
  })
  default = {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
}

variable "cognito_token_validity" {
  description = "Token validity configuration"
  type = object({
    access_token_validity  = number
    id_token_validity      = number
    refresh_token_validity = number
  })
  default = {
    access_token_validity  = 60  # 1 hour
    id_token_validity      = 60  # 1 hour
    refresh_token_validity = 30  # 30 days
  }
}

variable "cognito_callback_urls" {
  description = "List of callback URLs"
  type        = list(string)
  default     = ["https://localhost:3000/callback"]
}

variable "cognito_logout_urls" {
  description = "List of logout URLs"
  type        = list(string)
  default     = ["https://localhost:3000/logout"]
}

variable "create_test_user" {
  description = "Whether to create a test user"
  type        = bool
  default     = true
}

# ECR Configuration
variable "ecr_repositories" {
  description = "List of ECR repositories to create"
  type = list(object({
    name                 = string
    image_tag_mutability = string
    scan_on_push         = bool
  }))
  default = [
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
}

variable "enable_ecr_lifecycle_policy" {
  description = "Enable lifecycle policy for ECR repositories"
  type        = bool
  default     = true
}

variable "ecr_untagged_image_expiration_days" {
  description = "Number of days to keep untagged images"
  type        = number
  default     = 1
}

variable "ecr_tagged_image_count_limit" {
  description = "Maximum number of tagged images to keep"
  type        = number
  default     = 10
}

variable "enable_ecr_encryption" {
  description = "Enable encryption for ECR repositories"
  type        = bool
  default     = true
}

variable "ecr_encryption_type" {
  description = "Encryption type for ECR repositories"
  type        = string
  default     = "AES256"
}

# Database Configuration
variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "petstore"
}

variable "database_username" {
  description = "Database master username"
  type        = string
  default     = "petstore_admin"
  sensitive   = true
}

variable "database_password" {
  description = "Database master password (leave empty to generate random)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "database_instance_class" {
  description = "The instance type of the RDS instance"
  type        = string
  default     = "db.t3.micro"
}

variable "database_allocated_storage" {
  description = "The allocated storage in gigabytes"
  type        = number
  default     = 20
}

variable "database_backup_retention_period" {
  description = "The days to retain backups for"
  type        = number
  default     = 7
}

variable "database_multi_az" {
  description = "Specifies if the RDS instance is multi-AZ"
  type        = bool
  default     = false
}

variable "database_storage_encrypted" {
  description = "Specifies whether the DB instance is encrypted"
  type        = bool
  default     = true
}

variable "database_deletion_protection" {
  description = "If the DB instance should have deletion protection enabled"
  type        = bool
  default     = false
}

variable "database_skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created"
  type        = bool
  default     = true
}

# ECS Configuration
variable "pet_service_image_uri" {
  description = "Docker image URI for pet service"
  type        = string
  default     = ""
}

variable "pet_service_cpu" {
  description = "CPU units for pet service"
  type        = number
  default     = 256
}

variable "pet_service_memory" {
  description = "Memory for pet service"
  type        = number
  default     = 512
}

variable "pet_service_desired_count" {
  description = "Desired count for pet service"
  type        = number
  default     = 1
}

variable "pet_service_port" {
  description = "Port for pet service"
  type        = number
  default     = 8000
}

variable "food_service_image_uri" {
  description = "Docker image URI for food service"
  type        = string
  default     = ""
}

variable "food_service_cpu" {
  description = "CPU units for food service"
  type        = number
  default     = 256
}

variable "food_service_memory" {
  description = "Memory for food service"
  type        = number
  default     = 512
}

variable "food_service_desired_count" {
  description = "Desired count for food service"
  type        = number
  default     = 1
}

variable "food_service_port" {
  description = "Port for food service"
  type        = number
  default     = 3000
}

# Logging Configuration
variable "enable_ecs_logging" {
  description = "Enable CloudWatch logging for ECS tasks"
  type        = bool
  default     = true
}

variable "enable_api_logging" {
  description = "Enable logging for API Gateway"
  type        = bool
  default     = true
}

variable "log_retention_in_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

# Auto Scaling Configuration
variable "enable_auto_scaling" {
  description = "Enable auto scaling for ECS services"
  type        = bool
  default     = false
}

variable "auto_scaling_config" {
  description = "Auto scaling configuration"
  type = object({
    min_capacity = number
    max_capacity = number
    target_cpu   = number
  })
  default = {
    min_capacity = 1
    max_capacity = 3
    target_cpu   = 70
  }
}

# API Gateway Configuration
variable "api_gateway_stage_name" {
  description = "Name of the API Gateway stage"
  type        = string
  default     = "dev"
}

variable "enable_api_key" {
  description = "Enable API key for additional security"
  type        = bool
  default     = false
}

variable "enable_api_throttling" {
  description = "Enable throttling for API Gateway"
  type        = bool
  default     = true
}

variable "api_throttle_settings" {
  description = "Throttle settings for API Gateway"
  type = object({
    rate_limit  = number
    burst_limit = number
  })
  default = {
    rate_limit  = 1000
    burst_limit = 2000
  }
}

variable "enable_cors" {
  description = "Enable CORS for API Gateway"
  type        = bool
  default     = true
}

variable "cors_configuration" {
  description = "CORS configuration"
  type = object({
    allow_credentials = bool
    allow_headers     = list(string)
    allow_methods     = list(string)
    allow_origins     = list(string)
    expose_headers    = list(string)
    max_age          = number
  })
  default = {
    allow_credentials = true
    allow_headers     = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"]
    allow_methods     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins     = ["*"]
    expose_headers    = []
    max_age          = 86400
  }
}