terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.17.0"
    }
  }

  backend "s3" {
    bucket = "hackmidwest23-synsurf-tfstate"
    key    = "terraform/master.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  # Configuration options
}