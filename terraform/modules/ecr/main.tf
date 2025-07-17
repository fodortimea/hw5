# ECR Repositories
resource "aws_ecr_repository" "repositories" {
  for_each = {
    for repo in var.repositories : repo.name => repo
  }

  name                 = "${var.project_name}-${var.environment}-${each.value.name}"
  image_tag_mutability = each.value.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = each.value.scan_on_push
  }

  encryption_configuration {
    encryption_type = var.enable_encryption ? var.encryption_type : "AES256"
    kms_key         = var.enable_encryption && var.encryption_type == "KMS" ? var.kms_key_id : null
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-${each.value.name}"
    Environment = var.environment
    Project     = var.project_name
    Service     = each.value.name
  }
}

# Default Lifecycle Policy
locals {
  default_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.tagged_image_count_limit} tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "latest"]
          countType     = "imageCountMoreThan"
          countNumber   = var.tagged_image_count_limit
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images older than ${var.untagged_image_expiration_days} day(s)"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = var.untagged_image_expiration_days
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Lifecycle Policy
resource "aws_ecr_lifecycle_policy" "policy" {
  for_each = var.enable_lifecycle_policy ? aws_ecr_repository.repositories : {}

  repository = each.value.name
  policy     = var.lifecycle_policy != "" ? var.lifecycle_policy : local.default_lifecycle_policy
}

# Repository Policy for cross-account access (if needed)
resource "aws_ecr_repository_policy" "policy" {
  for_each = aws_ecr_repository.repositories

  repository = each.value.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPushPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:CompleteLayerUpload",
          "ecr:GetDownloadUrlForLayer",
          "ecr:InitiateLayerUpload",
          "ecr:PutImage",
          "ecr:UploadLayerPart"
        ]
      }
    ]
  })
}

# Data source for current AWS account ID
data "aws_caller_identity" "current" {}