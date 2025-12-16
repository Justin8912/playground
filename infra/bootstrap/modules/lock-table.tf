resource "aws_dynamodb_table" "terraform_locks" {
  name           = "${var.stack_name}-terraform-locks-${data.aws_caller_identity.current.account_id}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
