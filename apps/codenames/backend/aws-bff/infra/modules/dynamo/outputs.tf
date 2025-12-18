output "table" {
    value = {
        name     = aws_dynamodb_table.codenames_table.name
        arn      = aws_dynamodb_table.codenames_table.arn
        gsi_name = tolist(aws_dynamodb_table.codenames_table.global_secondary_index)[0].name
    }
}