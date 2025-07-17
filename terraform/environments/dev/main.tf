terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# Local values for commonly used configurations
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Database configuration
  database_password = var.database_password != "" ? var.database_password : random_password.db_password.result
  
  # Common tags
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Generate random password for database if not provided
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# ECR Module
module "ecr" {
  source = "../../modules/ecr"

  project_name                    = var.project_name
  environment                    = var.environment
  repositories                   = var.ecr_repositories
  enable_lifecycle_policy        = var.enable_ecr_lifecycle_policy
  untagged_image_expiration_days = var.ecr_untagged_image_expiration_days
  tagged_image_count_limit       = var.ecr_tagged_image_count_limit
  enable_encryption              = var.enable_ecr_encryption
  encryption_type                = var.ecr_encryption_type
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  project_name         = var.project_name
  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  enable_nat_gateway = var.enable_nat_gateway
  single_nat_gateway = var.single_nat_gateway
}

# Cognito Module
module "cognito" {
  source = "../../modules/cognito"

  project_name        = var.project_name
  environment        = var.environment
  domain_prefix      = var.cognito_domain_prefix
  password_policy    = var.cognito_password_policy
  token_validity     = var.cognito_token_validity
  callback_urls      = var.cognito_callback_urls
  logout_urls        = var.cognito_logout_urls
  create_test_user   = var.create_test_user
  test_user_password = local.database_password
}

# RDS Module
module "rds" {
  source = "../../modules/rds"

  project_name          = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.database_subnet_ids
  db_subnet_group_name = module.vpc.database_subnet_group_name
  database_name        = var.database_name
  master_username      = var.database_username
  master_password      = local.database_password
  instance_class       = var.database_instance_class
  allocated_storage    = var.database_allocated_storage
  backup_retention_period = var.database_backup_retention_period
  multi_az             = var.database_multi_az
  storage_encrypted    = var.database_storage_encrypted
  deletion_protection  = var.database_deletion_protection
  skip_final_snapshot  = var.database_skip_final_snapshot
  allowed_cidr_blocks  = [module.vpc.vpc_cidr_block]
}

# ECS Module
module "ecs" {
  source = "../../modules/ecs"

  project_name             = var.project_name
  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  private_subnet_ids         = module.vpc.private_subnet_ids
  public_subnet_ids          = module.vpc.public_subnet_ids
  database_url               = module.rds.connection_string
  secrets_manager_secret_arn = module.rds.secrets_manager_secret_arn
  cognito_user_pool_id       = module.cognito.user_pool_id
  cognito_user_pool_client_id = module.cognito.user_pool_client_id
  
  pet_service = {
    image_uri     = var.pet_service_image_uri != "" ? var.pet_service_image_uri : module.ecr.pet_service_image_uri
    cpu           = var.pet_service_cpu
    memory        = var.pet_service_memory
    desired_count = var.pet_service_desired_count
    port          = var.pet_service_port
  }
  
  food_service = {
    image_uri     = var.food_service_image_uri != "" ? var.food_service_image_uri : module.ecr.food_service_image_uri
    cpu           = var.food_service_cpu
    memory        = var.food_service_memory
    desired_count = var.food_service_desired_count
    port          = var.food_service_port
  }
  
  enable_logging           = var.enable_ecs_logging
  log_retention_in_days   = var.log_retention_in_days
  enable_auto_scaling     = var.enable_auto_scaling
  auto_scaling_config     = var.auto_scaling_config
}

# Docker Build Module
module "docker_build" {
  source = "../../modules/docker-build"

  project_root                 = var.project_root
  pet_service_repository_url   = module.ecr.pet_service_repository_url
  food_service_repository_url  = module.ecr.food_service_repository_url
  image_tag                    = var.docker_image_tag
  pet_service_port            = var.pet_service_port
  food_service_port           = var.food_service_port
  create_dockerfiles          = var.create_dockerfiles
  cleanup_local_images        = var.cleanup_local_images
  aws_region                  = var.aws_region

  depends_on = [module.ecr]
}

# API Gateway Module
module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name              = var.project_name
  environment              = var.environment
  cognito_user_pool_arn    = module.cognito.user_pool_arn
  cognito_user_pool_id     = module.cognito.user_pool_id
  alb_dns_name             = module.ecs.alb_dns_name
  pet_service_endpoint     = "/petstore/pets"
  food_service_endpoint    = "/petstore/foods"
  api_gateway_stage_name   = var.api_gateway_stage_name
  enable_api_key           = var.enable_api_key
  enable_throttling        = var.enable_api_throttling
  throttle_settings        = var.api_throttle_settings
  enable_logging           = var.enable_api_logging
  log_retention_in_days    = var.log_retention_in_days
  enable_cors              = var.enable_cors
  cors_configuration       = var.cors_configuration

  depends_on = [module.ecs, module.docker_build]
}