# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-user-pool"

  # Password policy
  password_policy {
    minimum_length    = var.password_policy.minimum_length
    require_lowercase = var.password_policy.require_lowercase
    require_numbers   = var.password_policy.require_numbers
    require_symbols   = var.password_policy.require_symbols
    require_uppercase = var.password_policy.require_uppercase
  }

  # Username configuration
  username_attributes = ["email"]
  
  # Auto-verified attributes
  auto_verified_attributes = ["email"]

  # Schema
  schema {
    attribute_data_type = "String"
    name               = "email"
    required           = true
    mutable            = true
  }

  schema {
    attribute_data_type = "String"
    name               = "name"
    required           = true
    mutable            = true
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = "OFF"  # OFF for cost optimization in MVP
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-user-pool"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-${var.environment}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Client settings
  generate_secret                           = false
  prevent_user_existence_errors            = "ENABLED"
  enable_token_revocation                  = true
  enable_propagate_additional_user_context_data = false

  # Token validity
  access_token_validity  = var.token_validity.access_token_validity
  id_token_validity      = var.token_validity.id_token_validity
  refresh_token_validity = var.token_validity.refresh_token_validity

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # Auth flows
  explicit_auth_flows = [
    "ADMIN_NO_SRP_AUTH",
    "USER_PASSWORD_AUTH"
  ]

  # OAuth settings
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                = ["email", "openid", "profile"]
  supported_identity_providers        = ["COGNITO"]

  # Callback URLs
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  depends_on = [aws_cognito_user_pool.main]
}

# Cognito Domain
##resource "aws_cognito_user_pool_domain" "main" {
##  domain       = var.domain_prefix
##  user_pool_id = aws_cognito_user_pool.main.id
##}
#
## Create a test user (conditional)
#resource "aws_cognito_user" "test_user" {
#  count = var.create_test_user ? 1 : 0
#
#  user_pool_id = aws_cognito_user_pool.main.id
#  username     = "test@example.com"
#  
#  attributes = {
#    email          = "test@example.com"
#    name           = "Test User"
#    email_verified = true
#  }
#
#  password = var.test_user_password
#  
#  # Force password change on first login
#  message_action = "SUPPRESS"  # Don't send welcome email for test user
#}