resource "aws_s3_bucket" "terraform_bucket" {
  bucket      = "${var.stack_name}-terraform-state-${data.aws_caller_identity.current.account_id}-${var.region}"
}

resource "aws_s3_bucket_ownership_controls" "bucket_owner_preferred" {
  bucket = aws_s3_bucket.terraform_bucket.bucket
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "terraform_bucket_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.bucket_owner_preferred]
  bucket = aws_s3_bucket.terraform_bucket.id

  acl         = "private"
}

resource "aws_s3_bucket_lifecycle_configuration" "terraform_bucket_lifecycle" {
  bucket = aws_s3_bucket.terraform_bucket.id

  rule {
    id      = "cleanNonCurrentTFState"

    filter {
      prefix = "tfstate/"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    status = "Enabled"
  }
}

resource "aws_s3_bucket_versioning" "terraform_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.terraform_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
