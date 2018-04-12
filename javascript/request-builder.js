function buildUrl() {
    var firstDate = document.getElementById("datepicker-1");
    var secondDate = document.getElementById("datepicker-2");
    var slider3 = document.getElementById("sliderNumOfDay");

    var query1 = "";
    var query2 = "";
    if (firstDate.value !== "") {
        query1 = "&dateFrom=" + getDateFormat(firstDate.value);
    }
    if (secondDate.value !== "") {
        query2 = "&dateTo=" + getDateFormat(secondDate.value);
    }

    var travelTypeArray = getTravelTypeSelectedArray();
    var travelTypeQuery = "&travelType=";
    for (var i = 0; i < travelTypeArray.length; i++) {
        if (i === 0)
            travelTypeQuery += travelTypeArray[i];
        else travelTypeQuery += "," + travelTypeArray[i];
    }

    var pathSpan = slider3.value;
    return "backend/api.php?"+query2+query1+"&pathSpan="+pathSpan + travelTypeQuery;
}


function requestPerPartes(page) {
    var url = buildUrl();
    return url += "&page=" + page;
}