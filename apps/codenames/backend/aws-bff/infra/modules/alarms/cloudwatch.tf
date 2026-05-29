resource "aws_cloudwatch_metric_alarm" "active_subscriptions" {
  alarm_name = "${var.stack_name}-active-subscriptions-alarm"
  alarm_description = "Alarm when there are more than ${var.active_subscriptions_alarm.threshold} active subscriptions"

  comparison_operator = "GreaterThanThreshold"
  threshold           = var.active_subscriptions_alarm.threshold
  evaluation_periods  = var.active_subscriptions_alarm.evaluation_periods
  period              = var.active_subscriptions_alarm.period

  metric_name         = "ActiveSubscriptions"
  namespace           = "AWS/AppSync"
  statistic           = "Average"
  treat_missing_data  = "notBreaching"

  dimensions = {
    GraphQLAPIId = var.appsync_api_id
  }

  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.alarms_topic.arn]
  ok_actions          = [aws_sns_topic.alarms_topic.arn]
}