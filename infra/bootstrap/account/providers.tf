terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.26"
    }
  }
  required_version = "~> 1.14.2"
}


provider "aws" {
  region  = "us-east-1"

  ignore_tags {
    key_prefixes = ["cai:"]
  }

  default_tags {
    tags = {
      "GithubRepo" = "playground",
      "Module" = "bootstrap-infra"
    }
  }
}