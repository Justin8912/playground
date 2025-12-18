resource "aws_lambda_function" "game_board_handler" {
    function_name = var.function_name
    role          = aws_iam_role.lambda_role.arn
    handler       = "app.handler"
    runtime       = "python3.12"
    filename      = "${path.module}/resources/dummy.zip"
    timeout       = 10
    memory_size   = 512

    environment {
        variables = {
            DYNAMODB_TABLE_NAME = var.table.name
            DYNAMODB_GSI_NAME   = var.table.gsi_name
        }
    }

    tracing_config {
        mode = "Active"
    }
}
