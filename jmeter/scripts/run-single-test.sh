#!/bin/bash

# Run a single JMeter test with specified parameters

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Usage function
usage() {
  echo "Usage: $0 <test-number> <user-count>"
  echo ""
  echo "Test numbers:"
  echo "  1 - Authentication Test"
  echo "  2 - Property Search Test"
  echo "  3 - Booking Test"
  echo "  4 - Owner Management Test"
  echo "  5 - AI Agent Test"
  echo ""
  echo "User count: Number of concurrent users (e.g., 100, 200, 500)"
  echo ""
  echo "Example: $0 1 100"
  exit 1
}

# Check arguments
if [ $# -ne 2 ]; then
  usage
fi

TEST_NUM=$1
USER_COUNT=$2

# Validate test number
if [ "$TEST_NUM" -lt 1 ] || [ "$TEST_NUM" -gt 5 ]; then
  echo -e "${RED}Error: Test number must be between 1 and 5${NC}"
  usage
fi

# Validate user count
if ! [[ "$USER_COUNT" =~ ^[0-9]+$ ]]; then
  echo -e "${RED}Error: User count must be a positive integer${NC}"
  usage
fi

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
JMETER_DIR="$PROJECT_ROOT/jmeter"
TEST_PLANS_DIR="$JMETER_DIR/test-plans"
RESULTS_DIR="$JMETER_DIR/results"
REPORTS_DIR="$JMETER_DIR/reports"

# Create results and reports directories
mkdir -p "$RESULTS_DIR"
mkdir -p "$REPORTS_DIR"

# Map test number to test plan
case $TEST_NUM in
  1)
    TEST_PLAN="1-authentication-test.jmx"
    TEST_NAME="Authentication Test"
    ;;
  2)
    TEST_PLAN="2-property-search-test.jmx"
    TEST_NAME="Property Search Test"
    ;;
  3)
    TEST_PLAN="3-booking-test.jmx"
    TEST_NAME="Booking Test"
    ;;
  4)
    TEST_PLAN="4-owner-management-test.jmx"
    TEST_NAME="Owner Management Test"
    ;;
  5)
    TEST_PLAN="5-ai-agent-test.jmx"
    TEST_NAME="AI Agent Test"
    ;;
esac

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  JMeter Performance Test           ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Test: $TEST_NAME"
echo "Concurrent Users: $USER_COUNT"
echo "Test Plan: $TEST_PLAN"
echo ""

# Create result file name
TEST_ID=$(basename "$TEST_PLAN" .jmx)
RESULT_FILE="$RESULTS_DIR/${TEST_ID}-${USER_COUNT}users-$(date +%Y%m%d-%H%M%S).csv"
LOG_FILE="$RESULTS_DIR/${TEST_ID}-${USER_COUNT}users-$(date +%Y%m%d-%H%M%S).log"
REPORT_DIR="$REPORTS_DIR/${TEST_ID}-${USER_COUNT}users-$(date +%Y%m%d-%H%M%S)"

echo -e "${YELLOW}Starting test...${NC}"
echo ""

# Run JMeter in non-GUI mode
jmeter -n \
  -t "$TEST_PLANS_DIR/$TEST_PLAN" \
  -l "$RESULT_FILE" \
  -j "$LOG_FILE" \
  -Jusers=$USER_COUNT \
  -e \
  -o "$REPORT_DIR"

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}=====================================${NC}"
  echo -e "${GREEN}  Test Completed Successfully! ✓    ${NC}"
  echo -e "${GREEN}=====================================${NC}"
  echo ""
  echo "Results saved to:"
  echo "  CSV: $RESULT_FILE"
  echo "  Log: $LOG_FILE"
  echo "  HTML Report: $REPORT_DIR/index.html"
  echo ""
  echo "View the HTML report in your browser:"
  echo "  open $REPORT_DIR/index.html"
  echo ""
else
  echo ""
  echo -e "${RED}=====================================${NC}"
  echo -e "${RED}  Test Failed! ✗                     ${NC}"
  echo -e "${RED}=====================================${NC}"
  echo ""
  echo "Check the log file for details:"
  echo "  $LOG_FILE"
  echo ""
  exit 1
fi

