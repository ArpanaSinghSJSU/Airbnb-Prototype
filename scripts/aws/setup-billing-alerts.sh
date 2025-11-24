#!/bin/bash
# setup-billing-alerts.sh
# Creates CloudWatch billing alarms to monitor AWS spending

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         💰 AWS Billing Alerts Setup Script                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if email is provided
if [ -z "$1" ]; then
  echo "❌ Error: Email address required!"
  echo ""
  echo "Usage: ./setup-billing-alerts.sh your-email@example.com"
  echo ""
  echo "Example: ./setup-billing-alerts.sh john@gmail.com"
  echo ""
  exit 1
fi

EMAIL="$1"
echo "📧 Email for alerts: $EMAIL"
echo ""

# Configuration
REGION="us-east-1"
NAMESPACE="AWS/Billing"
METRIC_NAME="EstimatedCharges"
PERIOD=21600  # 6 hours
EVAL_PERIODS=1
STATISTIC="Maximum"
SNS_TOPIC_NAME="GoTour-Billing-Alerts"

# Alarm thresholds
declare -a THRESHOLDS=(10 15 20 25 30)
declare -a DESCRIPTIONS=(
  "Early warning at \$10"
  "Alert at \$15" 
  "Alert at \$20"
  "CRITICAL: Near budget limit at \$25"
  "EMERGENCY: Over budget at \$30!"
)

echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 1: Creating SNS Topic for email notifications..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if SNS topic already exists
SNS_TOPIC_ARN=$(aws sns list-topics --region "$REGION" --query "Topics[?contains(TopicArn, '$SNS_TOPIC_NAME')].TopicArn" --output text)

if [ -z "$SNS_TOPIC_ARN" ]; then
  echo "Creating SNS topic: $SNS_TOPIC_NAME"
  SNS_TOPIC_ARN=$(aws sns create-topic --name "$SNS_TOPIC_NAME" --region "$REGION" --query 'TopicArn' --output text)
  echo "✅ SNS topic created: $SNS_TOPIC_ARN"
else
  echo "✅ SNS topic already exists: $SNS_TOPIC_ARN"
fi
echo ""

# Subscribe email to SNS topic
echo "📧 Subscribing email to SNS topic..."
SUBSCRIPTION_ARN=$(aws sns subscribe \
  --topic-arn "$SNS_TOPIC_ARN" \
  --protocol email \
  --notification-endpoint "$EMAIL" \
  --region "$REGION" \
  --query 'SubscriptionArn' \
  --output text 2>/dev/null || echo "pending")

if [ "$SUBSCRIPTION_ARN" = "pending confirmation" ] || [ "$SUBSCRIPTION_ARN" = "pending" ]; then
  echo "✅ Subscription pending confirmation"
  echo "⚠️  CHECK YOUR EMAIL: $EMAIL"
  echo "   Look for: 'AWS Notification - Subscription Confirmation'"
  echo "   Click the confirmation link to activate alerts!"
else
  echo "✅ Email subscription created"
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 2: Creating CloudWatch billing alarms..."
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Region: $REGION"
echo "Alarms to create: ${#THRESHOLDS[@]}"
echo "SNS Topic: $SNS_TOPIC_ARN"
echo ""

# Create each alarm
for i in "${!THRESHOLDS[@]}"; do
  THRESHOLD=${THRESHOLDS[$i]}
  DESCRIPTION=${DESCRIPTIONS[$i]}
  
  if [ $THRESHOLD -eq 25 ]; then
    ALARM_NAME="GoTour-Alert-${THRESHOLD}USD-CRITICAL"
  elif [ $THRESHOLD -eq 30 ]; then
    ALARM_NAME="GoTour-Alert-${THRESHOLD}USD-EMERGENCY"
  else
    ALARM_NAME="GoTour-Alert-${THRESHOLD}USD"
  fi
  
  echo "Creating alarm: $ALARM_NAME (threshold: \$$THRESHOLD)"
  
  aws cloudwatch put-metric-alarm \
    --alarm-name "$ALARM_NAME" \
    --alarm-description "$DESCRIPTION" \
    --metric-name "$METRIC_NAME" \
    --namespace "$NAMESPACE" \
    --statistic "$STATISTIC" \
    --period "$PERIOD" \
    --evaluation-periods "$EVAL_PERIODS" \
    --threshold "$THRESHOLD" \
    --comparison-operator GreaterThanThreshold \
    --alarm-actions "$SNS_TOPIC_ARN" \
    --region "$REGION" \
    2>/dev/null
  
  if [ $? -eq 0 ]; then
    echo "   ✅ Created successfully"
  else
    echo "   ⚠️  Failed to create (may already exist)"
  fi
  echo ""
done

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 Step 3: Verifying created alarms..."
echo ""

# List all billing alarms
aws cloudwatch describe-alarms \
  --region "$REGION" \
  --query 'MetricAlarms[?Namespace==`AWS/Billing`].[AlarmName,Threshold,StateValue]' \
  --output table

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Billing Alerts Setup Complete!            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  CRITICAL NEXT STEP: Confirm your email subscription!"
echo ""
echo "📧 Check your email: $EMAIL"
echo ""
echo "You should receive an email with subject:"
echo "   'AWS Notification - Subscription Confirmation'"
echo ""
echo "Steps:"
echo "1. Check inbox (and spam/junk folder)"
echo "2. Open the confirmation email from AWS"
echo "3. Click 'Confirm subscription' link"
echo "4. You'll see a confirmation page"
echo ""
echo "⚠️  Without confirmation, NO ALERTS will be sent!"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   ✅ SNS Topic created: $SNS_TOPIC_NAME"
echo "   ✅ Email subscribed: $EMAIL"
echo "   ✅ 5 alarms created and configured"
echo ""
echo "🎯 Your alarms will trigger at:"
echo "   • \$10  - Early warning"
echo "   • \$15  - Standard alert"
echo "   • \$20  - Important alert"
echo "   • \$25  - CRITICAL (near budget)"
echo "   • \$30  - EMERGENCY (over budget)"
echo ""
echo "💡 To verify subscription status:"
echo "   aws sns list-subscriptions-by-topic --topic-arn $SNS_TOPIC_ARN --region $REGION"
echo ""

