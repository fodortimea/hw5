# Pet Service Methods
resource "aws_api_gateway_method" "pets_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.pets.id
  http_method   = "ANY"
  authorization = "NONE"  # Temporarily disable auth for MVP testing
  # authorization = "COGNITO_USER_POOLS"
  # authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_method" "pets_proxy_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.pets_proxy.id
  http_method   = "ANY"
  authorization = "NONE"  # Temporarily disable auth for MVP testing
  # authorization = "COGNITO_USER_POOLS"
  # authorizer_id = aws_api_gateway_authorizer.cognito.id

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# Food Service Methods
resource "aws_api_gateway_method" "foods_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.foods.id
  http_method   = "ANY"
  authorization = "NONE"  # Temporarily disable auth for MVP testing
  # authorization = "COGNITO_USER_POOLS"
  # authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_method" "foods_proxy_any" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.foods_proxy.id
  http_method   = "ANY"
  authorization = "NONE"  # Temporarily disable auth for MVP testing
  # authorization = "COGNITO_USER_POOLS"
  # authorizer_id = aws_api_gateway_authorizer.cognito.id

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

# Pet Service Integration
resource "aws_api_gateway_integration" "pets_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.pets.id
  http_method = aws_api_gateway_method.pets_any.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${var.alb_dns_name}/petstore/pets"

  timeout_milliseconds = 29000
}

resource "aws_api_gateway_integration" "pets_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.pets_proxy.id
  http_method = aws_api_gateway_method.pets_proxy_any.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${var.alb_dns_name}/petstore/pets/{proxy}"

  timeout_milliseconds = 29000

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# Food Service Integration
resource "aws_api_gateway_integration" "foods_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.foods.id
  http_method = aws_api_gateway_method.foods_any.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${var.alb_dns_name}/petstore/foods"

  timeout_milliseconds = 29000
}

resource "aws_api_gateway_integration" "foods_proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.foods_proxy.id
  http_method = aws_api_gateway_method.foods_proxy_any.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${var.alb_dns_name}/petstore/foods/{proxy}"

  timeout_milliseconds = 29000

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}

# CORS Options Methods (if enabled)
resource "aws_api_gateway_method" "pets_options" {
  count = var.enable_cors ? 1 : 0

  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.pets.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "foods_options" {
  count = var.enable_cors ? 1 : 0

  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.foods.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# CORS Integration
resource "aws_api_gateway_integration" "pets_options_integration" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.pets.id
  http_method = aws_api_gateway_method.pets_options[0].http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration" "foods_options_integration" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.foods.id
  http_method = aws_api_gateway_method.foods_options[0].http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS Method Responses
resource "aws_api_gateway_method_response" "pets_options_response" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.pets.id
  http_method = aws_api_gateway_method.pets_options[0].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_method_response" "foods_options_response" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.foods.id
  http_method = aws_api_gateway_method.foods_options[0].http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# CORS Integration Responses
resource "aws_api_gateway_integration_response" "pets_options_integration_response" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.pets.id
  http_method = aws_api_gateway_method.pets_options[0].http_method
  status_code = aws_api_gateway_method_response.pets_options_response[0].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'${join(",", var.cors_configuration.allow_headers)}'"
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", var.cors_configuration.allow_methods)}'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_configuration.allow_origins)}'"
  }
}

resource "aws_api_gateway_integration_response" "foods_options_integration_response" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.foods.id
  http_method = aws_api_gateway_method.foods_options[0].http_method
  status_code = aws_api_gateway_method_response.foods_options_response[0].status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'${join(",", var.cors_configuration.allow_headers)}'"
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", var.cors_configuration.allow_methods)}'"
    "method.response.header.Access-Control-Allow-Origin"  = "'${join(",", var.cors_configuration.allow_origins)}'"
  }
}

# Add CORS headers to all method responses
resource "aws_api_gateway_method_response" "pets_any_response" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.pets.id
  http_method = aws_api_gateway_method.pets_any.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_method_response" "foods_any_response" {
  count = var.enable_cors ? 1 : 0

  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.foods.id
  http_method = aws_api_gateway_method.foods_any.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}