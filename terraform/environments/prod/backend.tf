# Backend configuration for production environment
# Using S3 remote backend for team collaboration

terraform {
  backend "s3" {
    bucket         = "petstore-terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "petstore-terraform-locks"
  }
}