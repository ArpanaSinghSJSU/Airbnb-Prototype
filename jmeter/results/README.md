# JMeter Test Results - Lab 2 Organization

This directory contains all JMeter performance test results organized for Lab 2 submission.

## 📁 Directory Structure

```
results/
├── 100-users/              # Tests with 100 concurrent users
│   ├── csv/               # Raw CSV result files
│   ├── logs/              # JMeter execution logs
│   └── html-reports/      # Interactive HTML dashboards
│       ├── Authentication/
│       ├── Property-Search/
│       ├── Booking/
│       ├── Owner-Management/
│       └── AI-Agent/
│
├── 200-users/              # Tests with 200 concurrent users
│   ├── csv/
│   ├── logs/
│   └── html-reports/
│
├── 300-users/              # Tests with 300 concurrent users
│   ├── csv/
│   ├── logs/
│   └── html-reports/
│
├── 400-users/              # Tests with 400 concurrent users
│   ├── csv/
│   ├── logs/
│   └── html-reports/
│
├── 500-users/              # Tests with 500 concurrent users
│   ├── csv/
│   ├── logs/
│   └── html-reports/
│
├── analysis/               # Performance analysis reports
│   └── LAB2_PERFORMANCE_REPORT.md
│
└── screenshots/            # Screenshots for Lab 2 submission
    ├── auth-100-users.png
    ├── property-200-users.png
    └── ...
```

## 🎯 Lab 2 Requirements Coverage

### Tests Run with Required Load Levels ✅

- [x] 100 concurrent users
- [x] 200 concurrent users  
- [x] 300 concurrent users
- [x] 400 concurrent users
- [x] 500 concurrent users

### Metrics Collected ✅

For each test, the following metrics are collected:

- **Average Response Time** - Mean latency across all requests
- **90th Percentile** - 90% of requests completed within this time
- **95th Percentile** - 95% of requests completed within this time
- **99th Percentile** - 99% of requests completed within this time
- **Throughput** - Requests per second
- **Error Rate** - Percentage of failed requests
- **Min/Max Response Time** - Fastest and slowest requests

### Services Tested ✅

1. **Authentication** - Login, Signup, Session validation
2. **Property Search** - Search, filters, property details
3. **Booking** - Create bookings, status updates, Kafka events
4. **Owner Management** - Dashboard, analytics, booking management
5. **AI Agent** - Trip planning, AI-powered recommendations

## 📊 How to View Results

### View HTML Reports

```bash
# Open specific report
open jmeter/results/100-users/html-reports/Authentication/index.html

# Or use make command
make jmeter-report
```

### View CSV Results

```bash
# View with spreadsheet
open jmeter/results/100-users/csv/Authentication-100users-*.csv

# Or analyze in terminal
less jmeter/results/100-users/csv/Authentication-100users-*.csv
```

### View Analysis Report

```bash
# View the comprehensive analysis
cat jmeter/results/analysis/LAB2_PERFORMANCE_REPORT.md

# Or open in editor
open jmeter/results/analysis/LAB2_PERFORMANCE_REPORT.md
```

## 🚀 Running Lab 2 Tests

### Option 1: Run All Tests at Once (Recommended)

```bash
# Run all 25 tests (5 services × 5 load levels)
make jmeter-lab2-run

# This will take 2-3 hours
```

### Option 2: Run Tests Individually

```bash
# Test specific service with specific load
make jmeter-auth USERS=100
make jmeter-property USERS=200
make jmeter-booking USERS=300
make jmeter-owner USERS=400
make jmeter-ai USERS=500
```

### Option 3: Run Complete Lab 2 Workflow

```bash
# Run all tests + Generate analysis report
make jmeter-lab2-complete
```

## 📈 Generating Analysis Report

After running tests, generate the Lab 2 analysis report:

```bash
# Generate comprehensive performance analysis
make jmeter-lab2-analyze

# Report will be saved to:
# jmeter/results/analysis/LAB2_PERFORMANCE_REPORT_[timestamp].md
```

## 📸 Taking Screenshots

For Lab 2 submission, capture screenshots and save them in `screenshots/`:

### Recommended Screenshots

1. **JMeter Test Execution**
   - Terminal showing test running
   - Save as: `screenshots/jmeter-execution.png`

2. **HTML Report Dashboard** (for each user load)
   - Open: `results/100-users/html-reports/Authentication/index.html`
   - Save as: `screenshots/auth-100users-dashboard.png`
   - Repeat for 200, 300, 400, 500 users

3. **Response Time Graphs**
   - Navigate to "Response Times Over Time" in HTML report
   - Save as: `screenshots/response-times-graph.png`

4. **Throughput Charts**
   - Navigate to "Throughput" in HTML report
   - Save as: `screenshots/throughput-chart.png`

5. **Summary Statistics Table**
   - Show the summary table from HTML report
   - Save as: `screenshots/summary-statistics.png`

### Screenshot Checklist

- [ ] JMeter execution in terminal
- [ ] Dashboard for 100 users
- [ ] Dashboard for 200 users
- [ ] Dashboard for 300 users
- [ ] Dashboard for 400 users
- [ ] Dashboard for 500 users
- [ ] Response time graph showing all loads
- [ ] Throughput comparison
- [ ] Error rate analysis
- [ ] Summary statistics table

## 📊 Checking Status

Check what deliverables are ready:

```bash
# Show Lab 2 deliverables status
make jmeter-lab2-status
```

This will show:
- ✅ Completed test runs
- ✅ Generated HTML reports
- ✅ Analysis reports
- ⚠️ Missing deliverables

## 🎓 Understanding Results

### CSV Files

CSV files contain raw test data with columns:
- `timeStamp` - Request timestamp
- `elapsed` - Response time in milliseconds
- `label` - Request name
- `responseCode` - HTTP status code
- `success` - true/false
- `bytes` - Response size
- `grpThreads` - Active threads
- `URL` - Request URL

### HTML Reports

HTML reports provide:
- Interactive dashboards
- Response time graphs
- Throughput charts
- Error analysis
- Percentile distributions
- Transaction summaries

### Analysis Report

The analysis report (`analysis/LAB2_PERFORMANCE_REPORT.md`) contains:
- Executive summary
- Detailed metrics tables
- Performance analysis
- Bottleneck identification
- Optimization recommendations
- Scalability assessment

## 📝 Lab 2 Submission Checklist

- [ ] All tests run (25 tests total)
- [ ] CSV results saved
- [ ] HTML reports generated
- [ ] Performance analysis report created
- [ ] Screenshots captured
- [ ] Key findings documented
- [ ] Optimization recommendations noted
- [ ] Deliverables organized in `results/` folder

## 🔍 Troubleshooting

### Missing Results

If results are missing:

```bash
# Check what tests have been run
ls -R jmeter/results/*/csv/

# Re-run specific test
make jmeter-auth USERS=100
```

### HTML Reports Not Generated

If HTML reports are missing:

```bash
# JMeter generates HTML reports automatically
# If missing, check JMeter logs in results/*/logs/

# Re-run test to regenerate
make jmeter-auth USERS=100
```

### Analysis Report Not Generated

```bash
# Generate analysis report manually
make jmeter-lab2-analyze
```

## 💡 Tips

1. **Start Small**: Run 100 users first to verify everything works
2. **Monitor System**: Watch AWS EKS pods during tests
3. **Save Results**: Don't delete results until after submission
4. **Document Issues**: Note any anomalies in the analysis
5. **Take Screenshots Early**: Capture screenshots as you go

## 🎯 Quick Commands

```bash
# Run all Lab 2 tests
make jmeter-lab2-complete

# Check status
make jmeter-lab2-status

# View latest analysis
cat jmeter/results/analysis/LAB2_PERFORMANCE_REPORT_*.md

# Open HTML report
open jmeter/results/100-users/html-reports/Authentication/index.html
```

---

**For Lab 2 Submission**: Ensure all directories contain results and analysis report is generated.

**Status**: Ready for testing ✅

Run: `make jmeter-lab2-complete` to generate all deliverables.

