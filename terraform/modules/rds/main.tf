# Use existing DB subnet group from VPC module
# DB Subnet Group is created by VPC module

locals {
  db_password = coalesce(var.master_password, random_password.master_password.result)
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = var.vpc_id
  description = "Security group for RDS database"

  # PostgreSQL access from VPC
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    description = "PostgreSQL access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Random password for DB (if not provided)
# resource "random_password" "master_password" {
#   count = var.master_password == "" ? 1 : 0

#   length  = 16
#   special = true
# }

resource "random_password" "master_password" {
  length  = 16
  special = true
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  # Engine
  engine         = "postgres"
  engine_version = var.engine_version

  # Instance
  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp2"
  storage_encrypted     = var.storage_encrypted

  # Database
  db_name  = var.database_name
  username = var.master_username
  password = var.master_password != "" ? var.master_password : local.db_password

  # Network
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.publicly_accessible

  # Backup
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  # Availability
  multi_az = var.multi_az

  # Monitoring
  performance_insights_enabled = false  # Disabled for cost optimization
  monitoring_interval         = 0       # Disabled for cost optimization

  # Deletion
  deletion_protection   = var.deletion_protection
  skip_final_snapshot  = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project_name}-${var.environment}-final-snapshot"

  # Enable automated minor version upgrade
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}

# NOTE: Database credentials are managed by Terraform-generated random passwords
# and passed directly to applications via environment variables.
# This approach is secure and doesn't require AWS Secrets Manager permissions.