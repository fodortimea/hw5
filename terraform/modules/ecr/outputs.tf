output "repository_arns" {
  description = "ARNs of the ECR repositories"
  value = {
    for name, repo in aws_ecr_repository.repositories : name => repo.arn
  }
}

output "repository_urls" {
  description = "URLs of the ECR repositories"
  value = {
    for name, repo in aws_ecr_repository.repositories : name => repo.repository_url
  }
}

output "repository_names" {
  description = "Names of the ECR repositories"
  value = {
    for name, repo in aws_ecr_repository.repositories : name => repo.name
  }
}

output "repository_registry_ids" {
  description = "Registry IDs of the ECR repositories"
  value = {
    for name, repo in aws_ecr_repository.repositories : name => repo.registry_id
  }
}

# Convenient outputs for specific services
output "pet_service_repository_url" {
  description = "URL of the pet service ECR repository"
  value       = aws_ecr_repository.repositories["pet-service"].repository_url
}

output "food_service_repository_url" {
  description = "URL of the food service ECR repository"
  value       = aws_ecr_repository.repositories["food-service"].repository_url
}

output "pet_service_repository_name" {
  description = "Name of the pet service ECR repository"
  value       = aws_ecr_repository.repositories["pet-service"].name
}

output "food_service_repository_name" {
  description = "Name of the food service ECR repository"
  value       = aws_ecr_repository.repositories["food-service"].name
}

# Docker commands for building and pushing
output "docker_commands" {
  description = "Docker commands for building and pushing images"
  value = {
    login_command = "aws ecr get-login-password --region ${data.aws_region.current.name} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
    
    pet_service_build_command = "docker build -t ${aws_ecr_repository.repositories["pet-service"].repository_url}:latest ./pet-service"
    pet_service_push_command  = "docker push ${aws_ecr_repository.repositories["pet-service"].repository_url}:latest"
    
    food_service_build_command = "docker build -t ${aws_ecr_repository.repositories["food-service"].repository_url}:latest ./food-service"
    food_service_push_command  = "docker push ${aws_ecr_repository.repositories["food-service"].repository_url}:latest"
  }
}

# Image URIs for use in ECS task definitions
output "pet_service_image_uri" {
  description = "Full image URI for pet service (latest tag)"
  value       = "${aws_ecr_repository.repositories["pet-service"].repository_url}:latest"
}

output "food_service_image_uri" {
  description = "Full image URI for food service (latest tag)"
  value       = "${aws_ecr_repository.repositories["food-service"].repository_url}:latest"
}

# Data sources
data "aws_region" "current" {}