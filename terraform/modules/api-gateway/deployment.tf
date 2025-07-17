# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.petstore.id,
      aws_api_gateway_resource.pets.id,
      aws_api_gateway_resource.foods.id,
      aws_api_gateway_resource.pets_proxy.id,
      aws_api_gateway_resource.foods_proxy.id,
      aws_api_gateway_method.pets_any.id,
      aws_api_gateway_method.pets_proxy_any.id,
      aws_api_gateway_method.foods_any.id,
      aws_api_gateway_method.foods_proxy_any.id,
      aws_api_gateway_integration.pets_integration.id,
      aws_api_gateway_integration.pets_proxy_integration.id,
      aws_api_gateway_integration.foods_integration.id,
      aws_api_gateway_integration.foods_proxy_integration.id,
      # Force redeployment for auth and CORS changes
      timestamp()
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.api_gateway_stage_name

  # Enable logging if requested
  dynamic "access_log_settings" {
    for_each = var.enable_logging ? [1] : []
    content {
      destination_arn = aws_cloudwatch_log_group.api_gateway[0].arn
      format = jsonencode({
        requestId      = "$context.requestId"
        ip             = "$context.identity.sourceIp"
        caller         = "$context.identity.caller"
        user           = "$context.identity.user"
        requestTime    = "$context.requestTime"
        httpMethod     = "$context.httpMethod"
        resourcePath   = "$context.resourcePath"
        status         = "$context.status"
        protocol       = "$context.protocol"
        responseLength = "$context.responseLength"
        errorMessage   = "$context.error.message"
        errorType      = "$context.error.messageString"
      })
    }
  }

  # Throttle settings are configured in method settings, not stage

  tags = {
    Name = "${var.project_name}-${var.environment}-api-stage"
  }
}

# API Gateway Method Settings
resource "aws_api_gateway_method_settings" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = var.enable_logging ? "INFO" : "OFF"
    data_trace_enabled = var.enable_logging
    throttling_rate_limit  = var.enable_throttling ? var.throttle_settings.rate_limit : -1
    throttling_burst_limit = var.enable_throttling ? var.throttle_settings.burst_limit : -1
  }
}

# API Key (if enabled)
resource "aws_api_gateway_api_key" "main" {
  count = var.enable_api_key ? 1 : 0

  name = "${var.project_name}-${var.environment}-api-key"

  tags = {
    Name = "${var.project_name}-${var.environment}-api-key"
  }
}

# Usage Plan (if API key is enabled)
resource "aws_api_gateway_usage_plan" "main" {
  count = var.enable_api_key ? 1 : 0

  name         = "${var.project_name}-${var.environment}-usage-plan"
  description  = "Usage plan for ${var.project_name} ${var.environment} API"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_stage.main.stage_name
  }

  quota_settings {
    limit  = 10000
    period = "MONTH"
  }

  throttle_settings {
    rate_limit  = var.throttle_settings.rate_limit
    burst_limit = var.throttle_settings.burst_limit
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-usage-plan"
  }
}

# Usage Plan Key (if API key is enabled)
resource "aws_api_gateway_usage_plan_key" "main" {
  count = var.enable_api_key ? 1 : 0

  key_id        = aws_api_gateway_api_key.main[0].id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main[0].id
}