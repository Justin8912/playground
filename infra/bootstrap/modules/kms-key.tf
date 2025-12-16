resource "aws_kms_key" "terraform_bucket_key" {
  description             = "This key is used to encrypt ${var.stack_name} tf state bucket objects"
  deletion_window_in_days = 10
  enable_key_rotation     = true
}

resource "aws_kms_alias" "key-alias" {
  name          = "alias/${var.stack_name}-terraform-bucket-key"
  target_key_id = aws_kms_key.terraform_bucket_key.key_id
}
