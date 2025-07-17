variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_prefix" {
  description = "Cognito domain prefix"
  type        = string
}

variable "password_policy" {
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

variable "token_validity" {
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

variable "callback_urls" {
  description = "List of callback URLs"
  type        = list(string)
  default     = ["https://localhost:3000/callback"]
}

variable "logout_urls" {
  description = "List of logout URLs"
  type        = list(string)
  default     = ["https://localhost:3000/logout"]
}

variable "create_test_user" {
  description = "Whether to create a test user"
  type        = bool
  default     = true
}

variable "test_user_password" {
  description = "Password for test user"
  type        = string
  sensitive   = true
  default     = ""
}