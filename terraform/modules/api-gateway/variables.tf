variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  type        = string
}

variable "pet_service_endpoint" {
  description = "Pet service endpoint path"
  type        = string
  default     = "/petstore/pets"
}

variable "food_service_endpoint" {
  description = "Food service endpoint path"
  type        = string
  default     = "/petstore/foods"
}

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

variable "enable_throttling" {
  description = "Enable throttling for API Gateway"
  type        = bool
  default     = true
}

variable "throttle_settings" {
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

variable "enable_logging" {
  description = "Enable logging for API Gateway"
  type        = bool
  default     = true
}

variable "log_retention_in_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
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