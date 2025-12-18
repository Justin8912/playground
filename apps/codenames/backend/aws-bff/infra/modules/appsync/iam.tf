resource "aws_iam_role" "appsync_role" {
    name               = "${var.stack_name}-appsync-role"
    assume_role_policy = data.aws_iam_policy_document.assume_appsync_role.json
}

resource "aws_iam_policy_attachment" "appsync_policy_attachment" {
  name       = "${var.stack_name}-appsync-policy-attachment"
  roles      = [aws_iam_role.appsync_role.name]
  policy_arn = aws_iam_policy.appsync_policy.arn
}

resource "aws_iam_policy" "appsync_policy" {
  name   = "${var.stack_name}-appsync-policy"
  policy = data.aws_iam_policy_document.appsync_policy_document.json
}

data "aws_iam_policy_document" "appsync_policy_document" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "deck_manager_lambda" {
    name               = "${var.stack_name}-appsync-lambda-role"
    assume_role_policy = data.aws_iam_policy_document.assume_appsync_role.json
}

resource "aws_iam_policy_attachment" "deck_manager_lambda_policy_attachment" {
  name       = "${var.stack_name}-appsync-deck-manager-lambda-policy-attachment"
  roles      = [aws_iam_role.deck_manager_lambda.name]
  policy_arn = aws_iam_policy.deck_manager_lambda_policy.arn
}

resource "aws_iam_policy" "deck_manager_lambda_policy" {
  name   = "${var.stack_name}-appsync-deck-manager-lambda-policy"
  policy = data.aws_iam_policy_document.deck_manager_lambda.json
}

data "aws_iam_policy_document" "deck_manager_lambda" {
  statement {
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction"
    ]

    resources = [var.deck_manager_lambda_arn]
  }
}

resource "aws_iam_role" "table_role" {
  name               = "${var.stack_name}-appsync-${var.table.name}-table-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.assume_appsync_role.json
}

resource "aws_iam_policy_attachment" "table_policy_attachment" {
  name       = "${var.stack_name}-appsync-table-policy-attachment"
  roles      = [aws_iam_role.table_role.name]
  policy_arn = aws_iam_policy.table_policy.arn
}

resource "aws_iam_policy" "table_policy" {
  name   = "${var.stack_name}-appsync-table-policy"
  policy = data.aws_iam_policy_document.table_role.json
}

data "aws_iam_policy_document" "table_role" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:getItem",
      "dynamodb:Scan",
      "dynamodb:Query",
      "dynamodb:UpdateItem"
    ]

    resources = [
      var.table.arn,
      "${var.table.arn}/*"
    ]
  }
}

data "aws_iam_policy_document" "assume_appsync_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["appsync.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}