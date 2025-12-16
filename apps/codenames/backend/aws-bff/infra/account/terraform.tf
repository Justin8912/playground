terraform {
  backend "s3" {
    bucket       = "playground-terraform-state-597106394031-us-east-1"
    key          = "tfstate/codenames-backend-us-east-1.tfstate"
    region       = "us-east-1"
    // This may be necessary in the future, but since I am doing everything locally now I dont need to set it up yet.
    # use_lockfile = false
  }

  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 6.26"
    }
  }
  required_version = "~> 1.14.2"
}