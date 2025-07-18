variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS services"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

variable "database_url" {
  description = "Database connection URL (deprecated - use secrets_manager_secret_arn)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret containing database credentials"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
}

# Pet Service Configuration
variable "pet_service" {
  description = "Configuration for pet service"
  type = object({
    image_uri     = string
    cpu           = number
    memory        = number
    desired_count = number
    port          = number
  })
  default = {
    image_uri     = "869935088019.dkr.ecr.eu-west-1.amazonaws.com/pet-store-dev-food-service:latest"
    cpu           = 256
    memory        = 512
    desired_count = 1
    port          = 8000
  }
}

# Food Service Configuration
variable "food_service" {
  description = "Configuration for food service"
  type = object({
    image_uri     = string
    cpu           = number
    memory        = number
    desired_count = number
    port          = number
  })
  default = {
    image_uri     = ""
    cpu           = 256
    memory        = 512
    desired_count = 1
    port          = 8001
  }
}

variable "enable_logging" {
  description = "Enable CloudWatch logging for ECS tasks"
  type        = bool
  default     = true
}

variable "log_retention_in_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

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