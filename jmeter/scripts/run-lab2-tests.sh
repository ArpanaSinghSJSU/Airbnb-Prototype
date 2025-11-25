#!/bin/bash

# Lab 2 JMeter Performance Testing - Run All Required Tests
# This script runs all tests with required load levels: 100, 200, 300, 400, 500 users

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Lab 2 JMeter Performance Testing Suite                ║${NC}"
echo -e "${GREEN}║     Testing: 100, 200, 300, 400, 500 Concurrent Users     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
JMETER_DIR="$PROJECT_ROOT/jmeter"
TEST_PLANS_DIR="$JMETER_DIR/test-plans"
RESULTS_DIR="$JMETER_DIR/results"

# Test plans
TEST_PLANS=(
  "1-authentication-test.jmx:Authentication"
  "2-property-search-test.jmx:Property-Search"
  "3-booking-test.jmx:Booking"
  "4-owner-management-test.jmx:Owner-Management"
  "5-ai-agent-test.jmx:AI-Agent"
)

# Required user loads for Lab 2
USER_LOADS=(100 200 300 400 500)

# Function to run a test
run_test() {
  local test_plan=$1
  local test_name=$2
  local user_count=$3
  
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Running: ${test_name} with ${user_count} concurrent users${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  # Create organized directory structure
  local result_dir="$RESULTS_DIR/${user_count}-users"
  mkdir -p "$result_dir/csv" "$result_dir/logs" "$result_dir/html-reports/${test_name}"
  
  # Create result file names with timestamp
  local timestamp=$(date +%Y%m%d-%H%M%S)
  local csv_file="$result_dir/csv/${test_name}-${user_count}users-${timestamp}.csv"
  local log_file="$result_dir/logs/${test_name}-${user_count}users-${timestamp}.log"
  local report_dir="$result_dir/html-reports/${test_name}"
  
  # Run JMeter in non-GUI mode
  echo "Starting test at $(date '+%H:%M:%S')..."
  jmeter -n \
    -t "$TEST_PLANS_DIR/$test_plan" \
    -l "$csv_file" \
    -j "$log_file" \
    -Jusers=$user_count \
    -e \
    -o "$report_dir"
  
  if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Test completed successfully${NC}"
    echo -e "  CSV Results: $csv_file"
    echo -e "  Log File: $log_file"
    echo -e "  HTML Report: $report_dir/index.html"
  else
    echo ""
    echo -e "${RED}✗ Test failed${NC}"
    return 1
  fi
  
  echo ""
}

# Main execution
main() {
  echo "Started at: $(date)"
  echo ""
  echo -e "${BLUE}Test Configuration:${NC}"
  echo "  Test Plans: ${#TEST_PLANS[@]}"
  echo "  User Loads: ${USER_LOADS[@]}"
  echo "  Total Tests: $((${#TEST_PLANS[@]} * ${#USER_LOADS[@]}))"
  echo ""
  echo -e "${YELLOW}Estimated Time: 2-3 hours${NC}"
  echo ""
  echo "Press Ctrl+C within 5 seconds to cancel..."
  sleep 5
  echo ""
  
  local total_tests=$((${#TEST_PLANS[@]} * ${#USER_LOADS[@]}))
  local current_test=0
  local failed_tests=0
  local start_time=$(date +%s)
  
  # Run tests for each user load
  for user_load in "${USER_LOADS[@]}"; do
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Testing with ${user_load} Concurrent Users                   ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    for test_info in "${TEST_PLANS[@]}"; do
      IFS=':' read -r test_plan test_name <<< "$test_info"
      
      current_test=$((current_test + 1))
      echo -e "${BLUE}[Test $current_test/$total_tests]${NC}"
      
      if ! run_test "$test_plan" "$test_name" "$user_load"; then
        failed_tests=$((failed_tests + 1))
      fi
      
      # Wait between tests to allow system to stabilize
      if [ $current_test -lt $total_tests ]; then
        echo -e "${YELLOW}Waiting 30 seconds before next test...${NC}"
        sleep 30
      fi
    done
  done
  
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  local hours=$((duration / 3600))
  local minutes=$(((duration % 3600) / 60))
  
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║              Lab 2 Testing Complete!                       ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Finished at: $(date)"
  echo "Duration: ${hours}h ${minutes}m"
  echo ""
  echo "Total tests run: $total_tests"
  echo "Failed tests: $failed_tests"
  echo "Success rate: $(( (total_tests - failed_tests) * 100 / total_tests ))%"
  echo ""
  echo -e "${BLUE}Results Organization:${NC}"
  echo "  100 users: $RESULTS_DIR/100-users/"
  echo "  200 users: $RESULTS_DIR/200-users/"
  echo "  300 users: $RESULTS_DIR/300-users/"
  echo "  400 users: $RESULTS_DIR/400-users/"
  echo "  500 users: $RESULTS_DIR/500-users/"
  echo ""
  echo -e "${YELLOW}Next Steps:${NC}"
  echo "  1. Generate analysis: ./jmeter/scripts/generate-lab2-analysis.sh"
  echo "  2. Take screenshots of HTML reports"
  echo "  3. Review performance analysis report"
  echo ""
  
  if [ $failed_tests -eq 0 ]; then
    echo -e "${GREEN}All tests passed! Ready for Lab 2 submission! 🎉${NC}"
    return 0
  else
    echo -e "${RED}Some tests failed. Please check the logs.${NC}"
    return 1
  fi
}

# Run main function
main

