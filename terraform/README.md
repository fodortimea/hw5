# Pet Store Infrastructure - Terraform

Complete AWS infrastructure deployment for the Pet Store microservices application using Terraform.

## 🏗️ Architecture

This Terraform configuration deploys a complete microservices architecture on AWS:

```

┌─────────────────────────────────────────────────────────────────┐
│                           AWS VPC                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Public Subnet │  │   Public Subnet │  │   Public Subnet │  │
│  │                 │  │                 │  │                 │  │
│  │       ALB       │  │       NAT       │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Private Subnet │  │  Private Subnet │  │  Private Subnet │  │
│  │                 │  │                 │  │                 │  │
│  │  ECS Services   │  │  ECS Services   │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Database Subnet │  │ Database Subnet │  │ Database Subnet │  │
│  │                 │  │                 │  │                 │  │
│  │       RDS       │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Components

### Core Infrastructure

- **VPC**: Multi-AZ Virtual Private Cloud
- **Subnets**: Public, Private, and Database subnets
- **Security Groups**: Network access control
- **Internet Gateway**: Public internet access
- **NAT Gateway**: Private subnet internet access

### Container Services

- **ECS Fargate**: Serverless container orchestration
- **Application Load Balancer**: Traffic distribution
- **ECR**: Container image registry
- **CloudWatch**: Logging and monitoring

### Database & Storage

- **RDS PostgreSQL**: Managed relational database
- **Secrets Manager**: Secure credential storage (optional)

### Authentication & API

- **Cognito**: User authentication and authorization
- **API Gateway**: External API access with JWT validation

## 📁 Structure

```
terraform/
├── main.tf                    # Main infrastructure configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── provider.tf                # AWS provider configuration
├── environments/              # Environment-specific configurations
│   ├── dev/                   # Development environment
│   │   ├── terraform.tfvars   # Dev-specific variables
│   │   └── backend.tf         # Dev backend configuration
│   └── prod/                  # Production environment
│       ├── terraform.tfvars   # Prod-specific variables
│       └── backend.tf         # Prod backend configuration
└── modules/                   # Reusable Terraform modules
    ├── api-gateway/           # API Gateway module
    ├── cognito/               # Cognito authentication module
    ├── docker-build/          # Docker build automation
    ├── ecr/                   # ECR repository module
    ├── ecs/                   # ECS service module
    ├── rds/                   # RDS database module
    └── vpc/                   # VPC networking module
```

## 🛠️ Usage

### Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.0 installed
- Docker or Podman for container builds

### **⚠️ IMPORTANT: First-Time Setup (Remote State)**

Before running Terraform for the first time, you need to set up remote state storage for team collaboration:

```bash
# 1. Run the setup script to create S3 bucket and DynamoDB table
./setup-remote-state.sh

# 2. Initialize Terraform with remote backend
terraform init

# 3. When prompted, type 'yes' to migrate existing state to remote backend
```

**Why this is needed:**
- **Team Collaboration**: Multiple developers can work on the same infrastructure
- **State Locking**: Prevents concurrent modifications that could corrupt state
- **Backup & Recovery**: State is safely stored in S3 with versioning
- **Security**: Encrypted storage with proper access controls

**Best Practice**: Run this setup once per project, not per environment. The script creates separate buckets for dev/prod but shares the same DynamoDB table for locking.

### Development Deployment

```bash
# Initialize Terraform (after remote state setup)
terraform init

# Review planned changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Deploy infrastructure
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Production Deployment

```bash
# Copy and customize production variables
cp environments/prod/terraform.tfvars.example environments/prod/terraform.tfvars
# Edit with production-specific values

# Deploy to production
terraform plan -var-file=environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars
```

## ⚙️ Configuration

### Key Variables

#### Environment Configuration

```hcl
# Basic configuration
project_name = "pet-store"
environment = "dev"
aws_region = "eu-west-1"

# Network configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["eu-west-1a", "eu-west-1b"]
```

#### Database Configuration

```hcl
# Database settings
database_name = "petstore"
database_username = "petstore_admin"
database_instance_class = "db.t3.micro"
database_allocated_storage = 20
database_multi_az = false  # true for production
```

#### Service Configuration

```hcl
# Pet Service
pet_service_cpu = 256
pet_service_memory = 512
pet_service_desired_count = 1
pet_service_port = 8000

# Food Service
food_service_cpu = 256
food_service_memory = 512
food_service_desired_count = 1
food_service_port = 8001
```

#### Docker Build Configuration

```hcl
# Docker build settings
skip_docker_build = false  # Set to true to skip Docker builds
create_dockerfiles = false
cleanup_local_images = true
```

### Environment Differences

#### Development

- Single NAT Gateway (cost optimization)
- Smaller instance sizes
- Shorter log retention
- Test user creation enabled
- Permissive CORS settings

#### Production

- Multi-AZ deployment
- Larger instance sizes
- Longer log retention
- Auto-scaling enabled
- Restricted CORS origins
- API key authentication

## 🔧 Modules

### VPC Module

Creates the foundational networking infrastructure:

- VPC with configurable CIDR
- Public, private, and database subnets
- Internet Gateway and NAT Gateway
- Route tables and security groups

### ECS Module

Deploys the container services:

- ECS Fargate cluster
- Application Load Balancer
- Service definitions for pet and food services
- Auto-scaling configuration
- CloudWatch logging

### RDS Module

Manages the database infrastructure:

- PostgreSQL database instance
- Security groups for database access
- Subnet group configuration
- Backup and encryption settings

### Cognito Module

Handles user authentication:

- User pool and client configuration
- JWT token settings
- Password policies
- Test user creation (dev only)

### API Gateway Module

Provides external API access:

- REST API with Cognito authorizer
- CORS configuration
- Throttling and logging
- VPC link integration

### ECR Module

Manages container registries:

- Repository creation
- Lifecycle policies
- Security scanning
- Access permissions

## 📊 Outputs

After deployment, Terraform outputs key information:

```bash
# Infrastructure endpoints
alb_dns_name = "pet-store-dev-alb-123456789.eu-west-1.elb.amazonaws.com"
api_gateway_invoke_url = "https://abcdef123.execute-api.eu-west-1.amazonaws.com/dev"

# Database information
database_endpoint = "pet-store-dev-db.xyz.eu-west-1.rds.amazonaws.com:5432"
database_name = "petstore"

# Authentication
cognito_user_pool_id = "eu-west-1_AbCdEfGhI"
cognito_user_pool_client_id = "1234567890abcdef"

# Container repositories
ecr_repository_urls = {
  "food-service" = "123456789.dkr.ecr.eu-west-1.amazonaws.com/pet-store-dev-food-service"
  "pet-service" = "123456789.dkr.ecr.eu-west-1.amazonaws.com/pet-store-dev-pet-service"
}
```

## 🔒 Security

### Network Security

- Private subnets for services and database
- Security groups with minimal required access
- NAT Gateway for private subnet internet access

### Data Security

- RDS encryption at rest
- Secrets Manager for sensitive data (optional)
- VPC endpoints for AWS services

### Access Control

- IAM roles with least privilege
- Service-specific permissions
- Cognito-based API authentication

## 📈 Monitoring

### CloudWatch Integration

- ECS Container Insights
- Application and infrastructure logs
- Custom metrics and alarms

### Health Checks

- Application Load Balancer health checks
- ECS service health monitoring
- Database connection monitoring

## 🚨 Troubleshooting

### Common Issues

#### Backend Configuration Issues

```bash
# Error: "Backend initialization required"
terraform init

# Error: "Failed to get existing workspaces"
# This usually means S3 bucket doesn't exist
./setup-remote-state.sh

# Error: "Error locking state"
# Someone else is running terraform or process was killed
# List existing locks:
aws dynamodb scan --table-name petstore-terraform-locks --region eu-west-1
# Remove stale locks (be careful!):
terraform force-unlock LOCK_ID
```

#### State Migration Issues

```bash
# Moving from local to remote state
terraform init
# When prompted: "Do you want to copy existing state to the new backend?"
# Type: yes

# If migration fails, you can manually backup local state:
cp terraform.tfstate terraform.tfstate.backup
```

#### Module Not Found

```bash
# Ensure you're in the terraform directory
cd terraform
terraform init
```

#### Provider Authentication

```bash
# Check AWS credentials
aws configure list
aws sts get-caller-identity
```

#### Resource Conflicts

```bash
# Check for existing resources
terraform plan -var-file=environments/dev/terraform.tfvars
```

### Debug Commands

```bash
# Show current state
terraform show

# List resources
terraform state list

# Refresh state
terraform refresh -var-file=environments/dev/terraform.tfvars

# Validate configuration
terraform validate
```

## 🔄 Lifecycle Management

### Updates

```bash
# Plan changes
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply changes
terraform apply -var-file=environments/dev/terraform.tfvars
```

### Destruction

```bash
# Destroy infrastructure (be careful!)
terraform destroy -var-file=environments/dev/terraform.tfvars
```

### State Management

```bash
# Import existing resources
terraform import aws_instance.example i-1234567890abcdef0

# Remove resources from state
terraform state rm aws_instance.example
```

## 📚 Best Practices

### Remote State Management

- **Always use remote state** for team projects (S3 + DynamoDB)
- **Enable versioning** on S3 bucket for state rollback capability
- **Use separate buckets** for different environments (dev/prod)
- **Share DynamoDB table** across environments for cost efficiency
- **Never edit state files manually** - use terraform commands only
- **Backup state before major changes** using `terraform state pull > backup.tfstate`

### Development

- Use separate environments for dev/staging/prod
- Keep sensitive data in separate tfvars files
- Use consistent naming conventions
- Document all variables and outputs
- Run `terraform plan` before every `apply`

### Production

- Enable remote state management (essential for teams)
- Use specific provider versions to avoid breaking changes
- Implement backup strategies for critical data
- Monitor resource costs with AWS Cost Explorer
- Use workspaces or separate state files for environment isolation

### Security

- Never commit sensitive data to version control
- Use IAM roles instead of access keys
- Enable encryption for all data stores
- Regular security audits
- Restrict S3 state bucket access to authorized users only
- Use least privilege IAM policies for Terraform execution

---

**Terraform Version**: >= 1.0  
**AWS Provider**: ~> 5.0  
**Region**: eu-west-1  
**Last Updated**: July 2025