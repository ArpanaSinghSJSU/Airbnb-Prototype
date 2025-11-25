#!/bin/bash

# JMeter Performance Testing Script - Run All Tests
# This script runs all JMeter test plans with different user loads

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  JMeter Performance Testing Suite  ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

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

# Test plans
TEST_PLANS=(
  "1-authentication-test.jmx"
  "2-property-search-test.jmx"
  "3-booking-test.jmx"
  "4-owner-management-test.jmx"
  "5-ai-agent-test.jmx"
)

# User loads to test
USER_LOADS=(100 200 300 400 500)

# Function to run a test
run_test() {
  local test_plan=$1
  local user_count=$2
  local test_name=$(basename "$test_plan" .jmx)
  
  echo -e "${YELLOW}Running ${test_name} with ${user_count} concurrent users...${NC}"
  
  # Create result file name
  local result_file="$RESULTS_DIR/${test_name}-${user_count}users-$(date +%Y%m%d-%H%M%S).csv"
  local log_file="$RESULTS_DIR/${test_name}-${user_count}users-$(date +%Y%m%d-%H%M%S).log"
  
  # Run JMeter in non-GUI mode
  jmeter -n \
    -t "$TEST_PLANS_DIR/$test_plan" \
    -l "$result_file" \
    -j "$log_file" \
    -Jusers=$user_count \
    -e \
    -o "$REPORTS_DIR/${test_name}-${user_count}users-report"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Test completed successfully${NC}"
    echo -e "  Results: $result_file"
    echo -e "  Report: $REPORTS_DIR/${test_name}-${user_count}users-report/index.html"
  else
    echo -e "${RED}✗ Test failed${NC}"
    return 1
  fi
  
  echo ""
}

# Main execution
main() {
  echo "Starting performance tests at $(date)"
  echo ""
  
  local total_tests=$((${#TEST_PLANS[@]} * ${#USER_LOADS[@]}))
  local current_test=0
  local failed_tests=0
  
  for test_plan in "${TEST_PLANS[@]}"; do
    for user_load in "${USER_LOADS[@]}"; do
      current_test=$((current_test + 1))
      echo -e "${YELLOW}[Test $current_test/$total_tests]${NC}"
      
      if ! run_test "$test_plan" "$user_load"; then
        failed_tests=$((failed_tests + 1))
      fi
      
      # Wait between tests to allow system to stabilize
      if [ $current_test -lt $total_tests ]; then
        echo -e "${YELLOW}Waiting 30 seconds before next test...${NC}"
        sleep 30
      fi
    done
  done
  
  echo ""
  echo -e "${GREEN}=====================================${NC}"
  echo -e "${GREEN}  Testing Complete!                  ${NC}"
  echo -e "${GREEN}=====================================${NC}"
  echo ""
  echo "Total tests run: $total_tests"
  echo "Failed tests: $failed_tests"
  echo "Success rate: $(( (total_tests - failed_tests) * 100 / total_tests ))%"
  echo ""
  echo "Results directory: $RESULTS_DIR"
  echo "Reports directory: $REPORTS_DIR"
  echo ""
  
  if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    return 0
  else
    echo -e "${RED}Some tests failed. Please check the logs.${NC}"
    return 1
  fi
}

# Run main function
main

