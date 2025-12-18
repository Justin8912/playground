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

  attribute {
    name = "GameId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = false
  }

  global_secondary_index {
    name            = "SelectByGameId"
    hash_key        = "GameId"
    range_key       = "SortKey"
    write_capacity  = 10
    read_capacity   = 10
    projection_type = "ALL"
  }
}