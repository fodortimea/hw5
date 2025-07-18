# Backend configuration for dev environment
# Using S3 remote backend for team collaboration

terraform {
  backend "s3" {
    bucket         = "petstore-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "petstore-terraform-locks"
  }
}