module "terraform_bootstrap" {
  source = "../modules/"

  region     = "us-east-1"
  stack_name = "playground"
}