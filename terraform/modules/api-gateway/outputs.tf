output "api_gateway_rest_api_id" {
  description = "ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_rest_api_arn" {
  description = "ARN of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.main.arn
}

output "api_gateway_deployment_id" {
  description = "ID of the API Gateway deployment"
  value       = aws_api_gateway_deployment.main.id
}

output "api_gateway_stage_name" {
  description = "Name of the API Gateway stage"
  value       = aws_api_gateway_stage.main.stage_name
}

output "api_gateway_stage_arn" {
  description = "ARN of the API Gateway stage"
  value       = aws_api_gateway_stage.main.arn
}

output "api_gateway_invoke_url" {
  description = "Invoke URL of the API Gateway"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "api_gateway_authorizer_id" {
  description = "ID of the Cognito authorizer"
  value       = aws_api_gateway_authorizer.cognito.id
}

output "vpc_link_id" {
  description = "ID of the VPC Link (not used in MVP)"
  value       = null
}

output "api_key_id" {
  description = "ID of the API Key (if enabled)"
  value       = var.enable_api_key ? aws_api_gateway_api_key.main[0].id : null
}

output "api_key_value" {
  description = "Value of the API Key (if enabled)"
  value       = var.enable_api_key ? aws_api_gateway_api_key.main[0].value : null
  sensitive   = true
}

output "usage_plan_id" {
  description = "ID of the Usage Plan (if API key is enabled)"
  value       = var.enable_api_key ? aws_api_gateway_usage_plan.main[0].id : null
}

# API Endpoints
output "pet_service_api_endpoint" {
  description = "Pet service API endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/petstore/pets"
}

output "food_service_api_endpoint" {
  description = "Food service API endpoint"
  value       = "${aws_api_gateway_stage.main.invoke_url}/petstore/foods"
}

output "api_gateway_url" {
  description = "Base URL of the API Gateway"
  value       = aws_api_gateway_stage.main.invoke_url
}