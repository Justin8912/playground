output "table_name" {
    value = aws_dynamodb_table.codenames_table.name
}

output "table_arn" {
    value = aws_dynamodb_table.codenames_table.arn
}

output "gsi_name" {
    value = tolist(aws_dynamodb_table.codenames_table.global_secondary_index)[0].name
}