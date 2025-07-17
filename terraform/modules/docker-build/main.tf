terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Create Dockerfiles if they don't exist
resource "local_file" "pet_service_dockerfile" {
  count = var.create_dockerfiles ? 1 : 0
  
  filename = "${var.project_root}/pet-service/Dockerfile"
  content = templatefile("${path.module}/templates/pet-service.Dockerfile.tpl", {
    port = var.pet_service_port
  })
}

resource "local_file" "food_service_dockerfile" {
  count = var.create_dockerfiles ? 1 : 0
  
  filename = "${var.project_root}/food-service/Dockerfile"
  content = templatefile("${path.module}/templates/food-service.Dockerfile.tpl", {
    port = var.food_service_port
  })
}

# Hash the source code directories to trigger rebuilds on changes
locals {
  pet_service_hash = sha256(join("", [
    for file in fileset("${var.project_root}/pet-service", "**/*") :
    filesha256("${var.project_root}/pet-service/${file}")
    if !can(regex("__pycache__|[.]pyc$|[.]git", file))
  ]))
  
  food_service_hash = sha256(join("", [
    for file in fileset("${var.project_root}/food-service", "**/*") :
    filesha256("${var.project_root}/food-service/${file}")
    if !can(regex("node_modules|[.]git", file))
  ]))
}

# ECR Login
resource "null_resource" "ecr_login" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "aws ecr get-login-password --region ${data.aws_region.current.name} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
  }
}

# Pet Service Docker Build and Push
resource "null_resource" "pet_service_build" {
  triggers = {
    source_hash = local.pet_service_hash
    image_tag   = var.image_tag
  }

  depends_on = [null_resource.ecr_login]

  provisioner "local-exec" {
    command = <<-EOT
      cd ${var.project_root}/pet-service
      docker build --platform linux/amd64 -t ${var.pet_service_repository_url}:${var.image_tag} .
      docker push ${var.pet_service_repository_url}:${var.image_tag}
      
      # Also tag as latest if this is the main tag
      if [ "${var.image_tag}" != "latest" ]; then
        docker tag ${var.pet_service_repository_url}:${var.image_tag} ${var.pet_service_repository_url}:latest
        docker push ${var.pet_service_repository_url}:latest
      fi
    EOT
  }
}

# Food Service Docker Build and Push
resource "null_resource" "food_service_build" {
  triggers = {
    source_hash = local.food_service_hash
    image_tag   = var.image_tag
  }

  depends_on = [null_resource.ecr_login]

  provisioner "local-exec" {
    command = <<-EOT
      cd ${var.project_root}/food-service
      docker build --platform linux/amd64 -t ${var.food_service_repository_url}:${var.image_tag} .
      docker push ${var.food_service_repository_url}:${var.image_tag}
      
      # Also tag as latest if this is the main tag
      if [ "${var.image_tag}" != "latest" ]; then
        docker tag ${var.food_service_repository_url}:${var.image_tag} ${var.food_service_repository_url}:latest
        docker push ${var.food_service_repository_url}:latest
      fi
    EOT
  }
}

# Optional: Clean up local images after push
resource "null_resource" "cleanup_images" {
  count = var.cleanup_local_images ? 1 : 0

  triggers = {
    pet_service_build  = null_resource.pet_service_build.id
    food_service_build = null_resource.food_service_build.id
  }

  depends_on = [
    null_resource.pet_service_build,
    null_resource.food_service_build
  ]

  provisioner "local-exec" {
    command = <<-EOT
      # Remove local images to save space
      docker rmi ${var.pet_service_repository_url}:${var.image_tag} || true
      docker rmi ${var.food_service_repository_url}:${var.image_tag} || true
      
      if [ "${var.image_tag}" != "latest" ]; then
        docker rmi ${var.pet_service_repository_url}:latest || true
        docker rmi ${var.food_service_repository_url}:latest || true
      fi
    EOT
  }
}