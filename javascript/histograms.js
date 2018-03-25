function abstractHistogram(containerId, data, title, color) {
    var histoDataArray = [];
    histoDataArray.push(["Type", "Amount"]);
    for (var element in data) {
        if (data.hasOwnProperty(element)) {
            var tmpArray = [];
            tmpArray.push(element);
            tmpArray.push(data[element]);
            histoDataArray.push(tmpArray);
        }
    }
    google.charts.load('current', {packages: ['corechart']});
    function drawChart() {
        var data = google.visualization.arrayToDataTable(histoDataArray);
        var options = {
            title: title,
            legend: {position: 'none'},
            colors: [color]
        };
        // Instantiate and draw the chart.
        var chart = new google.visualization.ColumnChart(document.getElementById(containerId));
        chart.draw(data, options);
    }
    google.charts.setOnLoadCallback(drawChart);
}

function showPathInfoModal(data) {
    abstractHistogram("container-travel-type", data['TRAVEL_STYLE'], "Travel style histogram", "#0984e3");
    abstractHistogram("container-gender", data['USERS_STATISTIC_GENDER'], "Gender histogram", "#e17055");
    abstractHistogram("container-age", data['USERS_STATISTIC_AGE'], "Age histogram", "#00b894");
}