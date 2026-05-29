resource "aws_sns_topic" "alarms_topic" {
  name = "${var.stack_name}-alarms-topic"
  display_name = "${var.stack_name} Alarms Topic"
}

// TODO: Figure out why text messages are not being sent
resource "aws_sns_topic_subscription" "texts_subscription" {
  count = var.enable_texts ? 1 : 0
  topic_arn = aws_sns_topic.alarms_topic.arn
  protocol  = "sms"
  endpoint  = var.phone_number
}

resource "aws_sns_topic_subscription" "emails_subscription" {
  topic_arn = aws_sns_topic.alarms_topic.arn
  protocol  = "email"
  endpoint  = "jnstendara@gmail.com"
}