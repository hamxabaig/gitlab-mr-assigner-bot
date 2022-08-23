terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region  = "ap-southeast-1"
}

resource "aws_ecr_repository" "gitlab-mr-bot-ecr" {
  name = var.info.ecr_repo
}
