provider "aws" {
  region  = "us-east-1"

  ignore_tags {
    key_prefixes = ["cai:"]
  }

  default_tags {
    tags = {
      "GithubRepo" = "playground",
      "Module" = "codenames"
    }
  }
}