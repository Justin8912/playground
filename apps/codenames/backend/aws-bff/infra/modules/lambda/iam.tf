resource "aws_iam_role" "lambda_role" {
  name               = "${var.function_name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_policy" "dynamo_policy" {
  name        = "${var.function_name}-lambda-permissions-policy"
  description = "IAM policy for ${var.function_name} Lambda function"
  policy      = data.aws_iam_policy_document.dynamo_permissions_policy.json
}

resource "aws_iam_role_policy_attachment" "dynamo_permission_attachment" {
  role = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.dynamo_policy.arn
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "dynamo_permissions_policy" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:BatchGetItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:PutItem",
      "dynamodb:updateItem",
      "dynamodb:DeleteItem",
      "dynamodb:BatchWriteItem"
    ]

    resources = [
      var.table.arn,
      "${var.table.arn}/**"
    ]
  }
}