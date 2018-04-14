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
    var city = "city=" + getCityName() + "&";
    var pathSpan = "&pathSpan=" + slider3.value;
    return "backend/api.php?" +
        city +
        query2 +
        query1 +
        pathSpan +
        travelTypeQuery;
}


function requestPerPartes(page) {
    var url = buildUrl();
    return url += "&page=" + page;
}

function buildInitUrl(page) {
    var url = "backend/api.php";
    url += "?city=" + getCityName();
    url += "&page=" + page;
    return url;
}