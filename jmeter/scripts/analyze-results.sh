#!/bin/bash

# Analyze JMeter test results and generate comparison reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  JMeter Results Analyzer            ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
JMETER_DIR="$PROJECT_ROOT/jmeter"
RESULTS_DIR="$JMETER_DIR/results"
REPORTS_DIR="$JMETER_DIR/reports"

# Check if results directory exists and has files
if [ ! -d "$RESULTS_DIR" ] || [ -z "$(ls -A "$RESULTS_DIR"/*.csv 2>/dev/null)" ]; then
  echo -e "${RED}No test results found in $RESULTS_DIR${NC}"
  echo "Please run tests first using run-all-tests.sh or run-single-test.sh"
  exit 1
fi

echo "Analyzing test results..."
echo ""

# Function to extract metrics from CSV
extract_metrics() {
  local csv_file=$1
  
  if [ ! -f "$csv_file" ]; then
    echo "N/A"
    return
  fi
  
  # Skip header and calculate metrics
  awk -F',' '
    NR > 1 {
      samples++
      elapsed_sum += $2
      if ($8 == "true" || $8 == "200") success++
      if (NR == 2 || $2 < min) min = $2
      if (NR == 2 || $2 > max) max = $2
      times[NR-2] = $2
    }
    END {
      if (samples > 0) {
        avg = elapsed_sum / samples
        error_rate = ((samples - success) / samples) * 100
        throughput = samples / (elapsed_sum / 1000)
        
        # Calculate percentiles (simplified)
        n = asort(times)
        p90_idx = int(n * 0.90)
        p95_idx = int(n * 0.95)
        p99_idx = int(n * 0.99)
        
        printf "Samples: %d\n", samples
        printf "Average Response Time: %.2f ms\n", avg
        printf "Min Response Time: %.2f ms\n", min
        printf "Max Response Time: %.2f ms\n", max
        printf "90th Percentile: %.2f ms\n", times[p90_idx]
        printf "95th Percentile: %.2f ms\n", times[p95_idx]
        printf "99th Percentile: %.2f ms\n", times[p99_idx]
        printf "Error Rate: %.2f%%\n", error_rate
        printf "Success Rate: %.2f%%\n", (success/samples)*100
        printf "Throughput: %.2f req/sec\n", throughput
      }
    }
  ' "$csv_file"
}

# Analyze each test type
echo -e "${BLUE}Analyzing results by test type...${NC}"
echo ""

for test_type in auth property booking owner ai; do
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  case $test_type in
    auth)
      echo -e "${YELLOW}Authentication Tests${NC}"
      pattern="1-authentication-test"
      ;;
    property)
      echo -e "${YELLOW}Property Search Tests${NC}"
      pattern="2-property-search-test"
      ;;
    booking)
      echo -e "${YELLOW}Booking Tests${NC}"
      pattern="3-booking-test"
      ;;
    owner)
      echo -e "${YELLOW}Owner Management Tests${NC}"
      pattern="4-owner-management-test"
      ;;
    ai)
      echo -e "${YELLOW}AI Agent Tests${NC}"
      pattern="5-ai-agent-test"
      ;;
  esac
  
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Find all CSV files for this test type
  files=$(ls -t "$RESULTS_DIR"/${pattern}*.csv 2>/dev/null || echo "")
  
  if [ -z "$files" ]; then
    echo "No results found"
    echo ""
    continue
  fi
  
  # Analyze each file
  for file in $files; do
    filename=$(basename "$file")
    
    # Extract user count from filename
    if [[ $filename =~ ([0-9]+)users ]]; then
      users="${BASH_REMATCH[1]}"
      echo ""
      echo -e "${GREEN}Results for $users concurrent users:${NC}"
      extract_metrics "$file"
    fi
  done
  
  echo ""
done

# Generate summary report
SUMMARY_FILE="$REPORTS_DIR/performance-summary-$(date +%Y%m%d-%H%M%S).txt"

echo -e "${BLUE}Generating summary report...${NC}"

{
  echo "========================================="
  echo "  JMeter Performance Test Summary"
  echo "  Generated: $(date)"
  echo "========================================="
  echo ""
  echo "Test Results Location: $RESULTS_DIR"
  echo "Reports Location: $REPORTS_DIR"
  echo ""
  
  for test_type in auth property booking owner ai; do
    case $test_type in
      auth) pattern="1-authentication-test"; name="Authentication Tests" ;;
      property) pattern="2-property-search-test"; name="Property Search Tests" ;;
      booking) pattern="3-booking-test"; name="Booking Tests" ;;
      owner) pattern="4-owner-management-test"; name="Owner Management Tests" ;;
      ai) pattern="5-ai-agent-test"; name="AI Agent Tests" ;;
    esac
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    files=$(ls -t "$RESULTS_DIR"/${pattern}*.csv 2>/dev/null || echo "")
    
    if [ -z "$files" ]; then
      echo "No results found"
      echo ""
      continue
    fi
    
    for file in $files; do
      filename=$(basename "$file")
      
      if [[ $filename =~ ([0-9]+)users ]]; then
        users="${BASH_REMATCH[1]}"
        echo ""
        echo "Results for $users concurrent users:"
        extract_metrics "$file"
      fi
    done
    
    echo ""
  done
  
} | tee "$SUMMARY_FILE"

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  Analysis Complete!                 ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "Summary report saved to:"
echo "  $SUMMARY_FILE"
echo ""
echo "Individual HTML reports available in:"
echo "  $REPORTS_DIR"
echo ""

