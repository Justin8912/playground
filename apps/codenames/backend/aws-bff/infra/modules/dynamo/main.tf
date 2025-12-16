resource "aws_dynamodb_table" "codenames_table" {
  name           = var.table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PartitionKey"
  range_key      = "SortKey"

  attribute {
    name = "PartitionKey"
    type = "S"
  }

  attribute {
    name = "SortKey"
    type = "S"
  }

  point_in_time_recovery {
    enabled = false
  }
}