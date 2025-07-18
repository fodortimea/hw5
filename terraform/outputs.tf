# ECR Outputs
output "ecr_repository_urls" {
  description = "URLs of the ECR repositories"
  value       = module.ecr.repository_urls
}

output "pet_service_repository_url" {
  description = "URL of the pet service ECR repository"
  value       = module.ecr.pet_service_repository_url
}

output "food_service_repository_url" {
  description = "URL of the food service ECR repository"
  value       = module.ecr.food_service_repository_url
}

output "docker_commands" {
  description = "Docker commands for building and pushing images"
  value       = module.ecr.docker_commands
}

# Docker Build Outputs
output "docker_build_status" {
  description = "Status of Docker builds"
  value = var.skip_docker_build ? {
    pet_service_build  = "Docker build skipped"
    food_service_build = "Docker build skipped"
  } : {
    pet_service_build  = module.docker_build[0].pet_service_build_status
    food_service_build = module.docker_build[0].food_service_build_status
  }
}

output "docker_image_uris" {
  description = "Docker image URIs"
  value = var.skip_docker_build ? {
    pet_service  = "${module.ecr.pet_service_repository_url}:latest"
    food_service = "${module.ecr.food_service_repository_url}:latest"
  } : {
    pet_service  = module.docker_build[0].pet_service_image_uri
    food_service = module.docker_build[0].food_service_image_uri
  }
}

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

# Cognito Outputs
output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = module.cognito.user_pool_client_id
}

# output "cognito_user_pool_domain" {
#   description = "Cognito User Pool Domain"
#   value       = module.cognito.user_pool_domain
# }

output "cognito_issuer_url" {
  description = "JWT issuer URL"
  value       = module.cognito.issuer_url
}

# Database Outputs
output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_instance_endpoint
}

output "database_port" {
  description = "RDS instance port"
  value       = module.rds.db_instance_port
}

output "database_name" {
  description = "RDS instance database name"
  value       = module.rds.db_instance_name
}

output "database_username" {
  description = "RDS instance master username"
  value       = module.rds.db_instance_username
  sensitive   = true
}

output "database_password" {
  description = "RDS instance master password"
  value       = local.database_password
  sensitive   = true
}

output "database_connection_string" {
  description = "Database connection string"
  value       = module.rds.connection_string
  sensitive   = true
}

output "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret containing DB credentials"
  value       = module.rds.secrets_manager_secret_arn
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.ecs_cluster_name
}

output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.ecs.alb_dns_name
}

output "pet_service_endpoint" {
  description = "Pet service endpoint"
  value       = module.ecs.pet_service_endpoint
}

output "food_service_endpoint" {
  description = "Food service endpoint"
  value       = module.ecs.food_service_endpoint
}

# API Gateway Outputs
output "api_gateway_invoke_url" {
  description = "Invoke URL of the API Gateway"
  value       = module.api_gateway.api_gateway_invoke_url
}

output "pet_service_api_endpoint" {
  description = "Pet service API endpoint"
  value       = module.api_gateway.pet_service_api_endpoint
}

output "food_service_api_endpoint" {
  description = "Food service API endpoint"
  value       = module.api_gateway.food_service_api_endpoint
}

output "api_key_value" {
  description = "Value of the API Key (if enabled)"
  value       = module.api_gateway.api_key_value
  sensitive   = true
}

# Testing Information
output "testing_information" {
  description = "Information for testing the deployed services"
  value = {
    cognito_user_pool_id     = module.cognito.user_pool_id
    cognito_client_id        = module.cognito.user_pool_client_id
    cognito_domain           = "N/A (domain disabled)"
    api_gateway_url          = module.api_gateway.api_gateway_invoke_url
    pet_service_api_endpoint = module.api_gateway.pet_service_api_endpoint
    food_service_api_endpoint = module.api_gateway.food_service_api_endpoint
    test_user_username       = var.create_test_user ? "testuser" : "N/A"
    test_user_email          = var.create_test_user ? "test@example.com" : "N/A"
  }
}

# Commands for testing
output "testing_commands" {
  description = "Commands for testing the deployed API"
  value = {
    get_jwt_token = "aws cognito-idp admin-initiate-auth --user-pool-id ${module.cognito.user_pool_id} --client-id ${module.cognito.user_pool_client_id} --auth-flow ADMIN_NO_SRP_AUTH --auth-parameters USERNAME=testuser,PASSWORD=<password>"
    test_pet_service = "curl -H \"Authorization: Bearer <JWT_TOKEN>\" ${module.api_gateway.pet_service_api_endpoint}"
    test_food_service = "curl -H \"Authorization: Bearer <JWT_TOKEN>\" ${module.api_gateway.food_service_api_endpoint}"
  }
}