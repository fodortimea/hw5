# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  count = var.enable_logging ? 1 : 0

  name              = "/aws/apigateway/${var.project_name}-${var.environment}-api"
  retention_in_days = var.log_retention_in_days

  tags = {
    Name = "${var.project_name}-${var.environment}-api-gateway-logs"
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-${var.environment}-api"
  description = "Pet Store API for ${var.environment} environment"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-api"
  }
}

# API Gateway Authorizer for Cognito
resource "aws_api_gateway_authorizer" "cognito" {
  name                   = "${var.project_name}-${var.environment}-cognito-authorizer"
  rest_api_id            = aws_api_gateway_rest_api.main.id
  type                   = "COGNITO_USER_POOLS"
  provider_arns          = [var.cognito_user_pool_arn]
  identity_source        = "method.request.header.Authorization"
  authorizer_credentials = aws_iam_role.api_gateway_authorizer.arn
}

# IAM Role for API Gateway Authorizer
resource "aws_iam_role" "api_gateway_authorizer" {
  name = "${var.project_name}-${var.environment}-api-gateway-authorizer-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-api-gateway-authorizer-role"
  }
}

# IAM Role for API Gateway CloudWatch Logs
resource "aws_iam_role" "api_gateway_logs" {
  count = var.enable_logging ? 1 : 0

  name = "${var.project_name}-${var.environment}-api-gateway-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-api-gateway-logs-role"
  }
}

resource "aws_iam_role_policy_attachment" "api_gateway_logs" {
  count = var.enable_logging ? 1 : 0

  role       = aws_iam_role.api_gateway_logs[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# API Gateway Account (for CloudWatch Logs)
resource "aws_api_gateway_account" "main" {
  count = var.enable_logging ? 1 : 0

  cloudwatch_role_arn = aws_iam_role.api_gateway_logs[0].arn
}

# For MVP, we'll skip VPC Link and use direct HTTP integration
# VPC Link requires Network Load Balancer, but we're using Application Load Balancer
# Direct HTTP integration will work for our MVP needs

# Root resource (/petstore)
resource "aws_api_gateway_resource" "petstore" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "petstore"
}

# Pets resource (/petstore/pets)
resource "aws_api_gateway_resource" "pets" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.petstore.id
  path_part   = "pets"
}

# Foods resource (/petstore/foods)
resource "aws_api_gateway_resource" "foods" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.petstore.id
  path_part   = "foods"
}

# Pets proxy resource (/petstore/pets/{proxy+})
resource "aws_api_gateway_resource" "pets_proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.pets.id
  path_part   = "{proxy+}"
}

# Foods proxy resource (/petstore/foods/{proxy+})
resource "aws_api_gateway_resource" "foods_proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.foods.id
  path_part   = "{proxy+}"
}