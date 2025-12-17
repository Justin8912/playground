resource "aws_lambda_function" "deck_generator" {
    function_name = var.function_name
    role          = aws_iam_role.lambda_role.arn
    handler       = "app.handler"
    runtime       = "python3.12"
    filename      = "${path.module}/resources/dummy.zip"
    timeout       = 10
    memory_size   = 512

    tracing_config {
        mode = "Active"
    }
}
