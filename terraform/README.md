# Pet Store Microservices Infrastructure

This directory contains the Terraform infrastructure code for the Pet Store microservices application, organized using best practices with modular architecture.

## Architecture Overview

The infrastructure deploys a complete microservices architecture on AWS:

- **VPC** with public/private/database subnets across multiple AZs
- **AWS Cognito** for JWT-based authentication
- **Amazon RDS** PostgreSQL database with encryption and backups
- **Amazon ECS** Fargate services for containerized microservices
- **Application Load Balancer** for service routing
- **API Gateway** with Cognito integration for external access
- **CloudWatch** for logging and monitoring

## Directory Structure

```
terraform/
├── modules/                    # Reusable Terraform modules
│   ├── vpc/                   # VPC and networking resources
│   ├── cognito/               # Authentication service
│   ├── rds/                   # Database layer
│   ├── ecs/                   # Container orchestration
│   └── api-gateway/           # API management
└── environments/
    └── dev/                   # Development environment
        ├── main.tf            # Main configuration
        ├── variables.tf       # Input variables
        ├── outputs.tf         # Output values
        └── terraform.tfvars.example
```

## Modules Description

### VPC Module (`modules/vpc/`)
- Creates VPC with public, private, and database subnets
- Configures Internet Gateway and NAT Gateway
- Sets up route tables and security groups
- Supports single NAT Gateway for cost optimization

### Cognito Module (`modules/cognito/`)
- Creates User Pool with configurable password policies
- Sets up User Pool Client with JWT token configuration
- Creates custom domain for authentication
- Optionally creates test user for development

### RDS Module (`modules/rds/`)
- Deploys PostgreSQL database with encryption
- Configures automated backups and maintenance windows
- Creates database subnet group and security groups
- Stores credentials in AWS Secrets Manager

### ECS Module (`modules/ecs/`)
- Creates ECS cluster with Fargate capacity providers
- Deploys pet and food service containers
- Configures Application Load Balancer with health checks
- Sets up auto-scaling policies (optional)
- Enables CloudWatch logging

### API Gateway Module (`modules/api-gateway/`)
- Creates REST API with Cognito authorization
- Configures VPC Link for ALB integration
- Sets up throttling and logging
- Enables CORS support
- Optionally creates API keys and usage plans

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **Docker** images built and pushed to ECR (for ECS deployment)