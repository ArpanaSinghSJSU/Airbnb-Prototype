/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 4.026676279740447, "KoPercent": 95.97332372025956};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.020710165825522712, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.039959765910753474, 500, 1500, "GET - Owner Dashboard"], "isController": false}, {"data": [0.06318580833942941, 500, 1500, "GET - Owner Profile"], "isController": false}, {"data": [0.0, 500, 1500, "GET - Owner Bookings"], "isController": false}, {"data": [0.0017893660531697342, 500, 1500, "POST - Owner Login"], "isController": false}, {"data": [0.0, 500, 1500, "PUT - Accept Booking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 27740, 26623, 95.97332372025956, 3378.9189257389867, 76, 60247, 97.0, 215.0, 60093.0, 60108.0, 78.7515578557092, 32.697592616118804, 22.34405119135152], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET - Owner Dashboard", 5468, 5097, 93.21506949524506, 299.6784930504757, 77, 5689, 101.0, 498.10000000000036, 807.0, 5109.620000000001, 18.66281669277686, 11.168688020284039, 4.788828996139787], "isController": false}, {"data": ["GET - Owner Profile", 5468, 5097, 93.21506949524506, 123.9197147037312, 77, 1988, 98.0, 134.0, 259.0, 684.6200000000008, 18.668423801898935, 7.547432035482979, 4.753806000150221], "isController": false}, {"data": ["GET - Owner Bookings", 5468, 5468, 100.0, 96.62783467446988, 77, 283, 95.0, 106.0, 113.0, 163.0, 18.669188668744816, 6.873324343864057, 4.662842621266077], "isController": false}, {"data": ["POST - Owner Login", 5868, 5493, 93.60940695296523, 15395.000170415831, 76, 60247, 98.0, 60100.0, 60105.0, 60182.0, 16.658765014322338, 5.702330768608391, 5.713874958480838], "isController": false}, {"data": ["PUT - Accept Booking", 5468, 5468, 100.0, 100.35735186539846, 78, 383, 96.0, 109.0, 139.0, 216.0, 18.6693161526459, 6.8727044261097285, 5.793243213252893], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Temporarily Unavailable", 3860, 14.498741689516583, 13.91492429704398], "isController": false}, {"data": ["502/Bad Gateway", 416, 1.5625586898546369, 1.4996395097332371], "isController": false}, {"data": ["504/Gateway Time-out", 1220, 4.582503850054464, 4.397981254506129], "isController": false}, {"data": ["401/Unauthorized", 10193, 38.28644405213537, 36.74477289113194], "isController": false}, {"data": ["404/Not Found", 10934, 41.069751718438944, 39.41600576784427], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 27740, 26623, "404/Not Found", 10934, "401/Unauthorized", 10193, "503/Service Temporarily Unavailable", 3860, "504/Gateway Time-out", 1220, "502/Bad Gateway", 416], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET - Owner Dashboard", 5468, 5097, "401/Unauthorized", 5097, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET - Owner Profile", 5468, 5097, "401/Unauthorized", 5096, "502/Bad Gateway", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET - Owner Bookings", 5468, 5468, "404/Not Found", 5468, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["POST - Owner Login", 5868, 5493, "503/Service Temporarily Unavailable", 3860, "504/Gateway Time-out", 1220, "502/Bad Gateway", 413, "", "", "", ""], "isController": false}, {"data": ["PUT - Accept Booking", 5468, 5468, "404/Not Found", 5466, "502/Bad Gateway", 2, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
