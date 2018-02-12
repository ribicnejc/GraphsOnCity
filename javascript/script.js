var map;
var mainPaths = {};
var mainUsers = {};
var quickStat = {};

var histoData1 = {};
var histoData2 = [];
var histoData3 = [];
var histoData4 = {};

var travelStyles = {};
var placeDetails = {};
var polyLines = [];

var sliderProperties = {
    maxNumberOfSamePaths: 0,
    maxLengthOfPath: 0
};
var dateProperties = {
    minimumDate: 20181212,
    maximumDate: 0
};
var firstLoad = true;

function reqListner() {
    var content = JSON.parse(this.responseText);
    //here make object with keys, so the keys are paths separated with dot or ;
    //Becase the main thing user see is PATH not username or other stuff
    //Here you will get diffrent paths from php and php will get you paths and paths will be keys, so you will be
    //able to regenerate path fast and search for important data and show it if user press on path
    // findPaths(content);
    parseResponse(content);
}

/** here we create path and put them together as key
 * value must be statistic of that path
 * that is number of users, type of users, but just unique types
 * then length of that path and dates of that path because users can
 * go through one path different times
 */
function parseResponse(data) {
    // Below for loop is for travel type which was selected to be used in paths
    var travelStyleForUser = getTravelTypeSelectedArray();

    // Below for loop is for place type which was selected to be filtered in later loop
    var placeTypeSelected = getPlaceTypeSelectedArray();

    //Here we read paths which we get from call response
    for (var uidKey in data) {
        if (data.hasOwnProperty(uidKey)) {
            var tmpObject = data[uidKey];
            mainUsers[uidKey] = tmpObject;
            var paths = tmpObject["PATHS"];
            var travleStyleUser = tmpObject["TRAVEL_STYLE"];

            //Collect and different travel style only first time
            if (firstLoad)
                collectTravelTypes(travleStyleUser);

            //Here we generate coords and create legit path for google maps
            for (var i = 0; i < paths.length; i++) {
                var path = paths[0];

                //Count and get longest path. This is for sliders setup
                if (sliderProperties.maxLengthOfPath < path.length && path.length > 1)
                    sliderProperties.maxLengthOfPath = path.length;

                var pathToDraw = [];
                var pathContainsCorrectPoints = false;
                var pathKey = "";
                for (var j = 0; j < path.length; j++) {
                    var point = path[j];
                    var lat = point["LAT"];
                    var lng = point["LNG"];
                    var placeDetailsPoint = point["PLACE_DETAILS"];
                    var date = parseInt(point["REVIEW_DATE"]);

                    if (firstLoad) {
                        //Calc max and min date
                        if (dateProperties.maximumDate < date)
                            dateProperties.maximumDate = date;
                        if (dateProperties.minimumDate > date)
                            dateProperties.minimumDate = date;

                        //Collect all place details for drop down
                        collectPlaceDetails(placeDetailsPoint);
                        pathContainsCorrectPoints = true;
                    } else {
                        // Here filter those paths which has at least one point
                        // with place types which has been selected by user
                        if (placeTypeSelected.length === 0) pathContainsCorrectPoints = true;
                        for(var pointTypeIndex = 0; pointTypeIndex < placeTypeSelected.length; pointTypeIndex++) {
                            if(placeDetailsPoint.indexOf(placeTypeSelected[pointTypeIndex]) !== -1) {
                                pathContainsCorrectPoints = true;
                                break;
                            }
                        }
                    }
                    pathKey += lat + lng;
                    var coordTuple = {};
                    coordTuple.lat = parseFloat(lat);
                    coordTuple.lng = parseFloat(lng);
                    pathToDraw.push(coordTuple);

                    addMarker(coordTuple, point.PLACE_NAME);
                }
                //Here is calculated statistics for path
                //DONE First we calculate num of path repeated
                //DONE Second we calculate num of each travel type for this path
                //TODO Third we calculate num of gender for that path
                //TODO Fourth we calculate num of age for that path
                //TODO add more elements for later analysis
                if (mainPaths[pathKey] === undefined && pathContainsCorrectPoints){
                    var pathStatisticData = {};
                    var styleStatisticData = {};
                    pathStatisticData["SAME_PATH_NUM"] = 1;
                    pathStatisticData["PATH"] = pathToDraw;
                    var travelTypeStat = travleStyleUser.split(" & ");
                    for (var tmpI = 0; tmpI < travelTypeStat.length; tmpI++) {
                        styleStatisticData[travelTypeStat[tmpI]] = 1;
                    }
                    pathStatisticData["TRAVEL_STYLE"] = styleStatisticData;
                    mainPaths[pathKey] = pathStatisticData;
                }else if(pathContainsCorrectPoints) {
                    var pathStatisticData2 = mainPaths[pathKey];
                    var tmpStat = pathStatisticData2["TRAVEL_STYLE"];
                    travelTypeStat = travleStyleUser.split(" & ");
                    for(var tmpJ = 0; tmpJ < travelTypeStat.length; tmpJ++) {
                        if (tmpStat[travelTypeStat[tmpJ]] === undefined) {
                            tmpStat[travelTypeStat[tmpJ]] = 1;
                        }else {
                            tmpStat[travelTypeStat[tmpJ]] = tmpStat[travelTypeStat[tmpJ]] + 1;
                        }
                    }
                    pathStatisticData2["TRAVEL_STYLE"] = tmpStat;
                    pathStatisticData2["SAME_PATH_NUM"] = pathStatisticData2["SAME_PATH_NUM"] + 1;
                    mainPaths[pathKey] = pathStatisticData2;
                }

            }
        }
    }

    if (firstLoad){
        //uncomment this line if you want to set data of sliders dynamicly not staticly which are set in HTML
        //updateSlidersSettings();
        fillTravelStylesDropdown();
        fillPlaceDetailsDropdown();
        updateDateSelections();
    }
    if (!firstLoad){
        var sliderNumOfSamePaths = document.getElementById("sliderNumberOfPaths");
        var minNumOfSamePaths = parseInt(sliderNumOfSamePaths.value);
        var sliderPathLength = document.getElementById("sliderNumOfPathLength");
        var minNumOfLength = parseInt(sliderPathLength.value);
    }
    //Here we draw paths which are stored in mainPaths
    /*TODO fix, so the first time graphs are shown, set slider to that value with which they are shown
        that means to set minimum date and maximum date of reviews, and set correct slider*/
    for (var pathKEY in mainPaths) {
        if (mainPaths.hasOwnProperty(pathKEY)) {
            var pathToDrawOn = mainPaths[pathKEY];
            var path2 = pathToDrawOn["PATH"];
            var numOfSamePaths = pathToDrawOn["SAME_PATH_NUM"];
            if (firstLoad)
                drawGraph(path2, numOfSamePaths);
            else if (numOfSamePaths >= minNumOfSamePaths && path2.length >= minNumOfLength)
                drawGraph(path2, numOfSamePaths);
        }
    }
    firstLoad = false;

    //uncomment below lines if you want to collect data for histograms
    // getHistoData()
    // getHistoData4();
    // getHistoData3();
}

function findPaths(data) {
    var paths = {};
    for (var i = 0; i < data.length; i++) {
        var userLine = data[i];
        var uid = userLine.UID;
        var coordTuple = {};
        coordTuple.lat = parseFloat(userLine.LAT);
        coordTuple.lng = parseFloat(userLine.LNG);

        addMarker(coordTuple, userLine.PLACE_NAME);

        if (paths[uid] === undefined) paths[uid] = [];

        var tmp = paths[uid];
        tmp.push(coordTuple);
        paths[uid] = tmp;
    }

    for (var uidKey in paths) {
        if (paths.hasOwnProperty(uidKey)) {
            if (paths[uidKey] === undefined) continue;
            drawGraph(paths[uidKey]);
        }
    }
}

function addMarker(coords, placeName) {
    var marker = new google.maps.Marker({
        position: coords,
        title: placeName
    });
    marker.setMap(map);
}

function drawGraph(pathData, num) {

    // uncomment below line if you want to collect histogram data
    // collectHistoData(pathData, num);

    this.userPath = new google.maps.Polyline({
        path: pathData,
        geodesic: true,
        strokeColor: colorLine(num),//"#0000FF",//randomColor(),
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    polyLines.push(this.userPath);

    //MOUSEOVER
    google.maps.event.addListener(this.userPath, 'mouseover', function () {
        this.setOptions({
            strokeOpacity: 0.5,
            strokeWeight: 5
        });
    });

    //ONCLICK
    google.maps.event.addListener(this.userPath, 'click', function () {
        // alert(JSON.stringify(pathData));
        // var path = JSON.stringify(pathData);
        var modalPath = new google.maps.Polyline({
            path: pathData,
            geodesic: true,
            strokeColor: colorLine(num),//"#0000FF",//randomColor(),
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        var center = getCenter(pathData);
        var dialogMap = new google.maps.Map(document.getElementById('mapDialog'), {
            zoom: 12,
            center: center,
            // center: {lat: 46.0548178, lng: 14.5042642},
            mapTypeId: 'terrain'
        });


        var pathKey = generateKeyForPath(pathData);
        var pathHistoData = mainPaths[pathKey];

        modalPath.setMap(dialogMap);
        var modal = $('#myModal');
        modal.modal();
        modal.on('shown.bs.modal', function () {
            google.maps.event.trigger(dialogMap, "resize");
            dialogMap.setCenter(center);
            histo(pathHistoData["TRAVEL_STYLE"]);
        });
        // alert(JSON.stringify(pathData));

    });

    //MOUSEOUT
    google.maps.event.addListener(this.userPath, 'mouseout', function () {
        this.setOptions({
            strokeOpacity: 1,
            strokeWeight: 2
        });
    });
    this.userPath.setMap(map);
}


function collectHistoData(pathData, num) {
    //Collect data for histograms

    //Histograms parameters
    var pathLength = pathData.length;
    var amountOfUserVisitThatPath = num;

    //Histogram2 algorithm
    var tmp = [pathLength, amountOfUserVisitThatPath];
    histoData2.push(tmp);

    //Histogram1 algorithm
    if (histoData1[pathLength] === undefined) {
        histoData1[pathLength] = amountOfUserVisitThatPath;
    }else {
        histoData1[pathLength] = amountOfUserVisitThatPath + histoData1[pathLength];
    }


}

function getHistoData() {
    //here is data retriever for histoData2
    var output = "dolzina_poti, stevilo_obiskov_te_poti\n";
    for(var i = 0; i < histoData2.length; i++) {
        output += histoData2[i][0] + ", " + histoData2[i][1] + "\n"
    }
    alert("Check Console");
    console.log(output);
}

function getHistoData4(){
    var output = "type, amount\n";
    for (var hist4Key in histoData4) {
        if (histoData4.hasOwnProperty(hist4Key)) {
            output += hist4Key + ", " + histoData4[hist4Key] + "\n";
        }
    }
    alert("Check histoData4");
    console.log(output);
}

function getHistoData3() {
    var output = "path, amount\n";
    for (var path in mainPaths) {
        if (mainPaths.hasOwnProperty(path)) {
            if(mainPaths[path]["PATH"].length > 1)
                output += path + ", " + mainPaths[path]["SAME_PATH_NUM"] + "\n";
        }
    }
    alert("Check histoData3");
    console.log(output);
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });
    requestData();
}

function randomColor() {
    var parts = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += parts[Math.floor(Math.random() * 15)];
    }
    return color;
}

function colorLine(amount){
    if (quickStat[amount] === undefined) {
        quickStat[amount] = 1;
    }else{
        quickStat[amount] = quickStat[amount]+1;
    }
    if (amount < 3) {
        return "#000";
    } else if (amount < 7) {
        return "#400";
    } else if (amount < 10) {
        return "#800";
    } else if (amount < 15) {
        return "#a00";
    } else
        return "#f00";
}

function requestData() {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListner);
    oReq.open("GET", "" +
        "backend/api.php");
    oReq.send();
}

// collectTravelTypes("Like a Local & History Buff & Art and Architecture Lover");
function collectTravelTypes(nameOfTravelType){
    var travelStyleParts = nameOfTravelType.split(" & ");
    for (var i = 0; i < travelStyleParts.length; i++) {
        travelStyles[travelStyleParts[i]] = true;
        //here we collect data for histograms of travel type distribution
        // if (histoData4[travelStyleParts[i]] === undefined) {
        //     histoData4[travelStyleParts[i]] = 1;
        // }else {
        //     histoData4[travelStyleParts[i]] = histoData4[travelStyleParts[i]] + 1;
        // }
    }
}

function collectPlaceDetails(placeDetailsPoint) {
    var placeDetailsParts = placeDetailsPoint.split(" & ");
    for (var i = 0; i < placeDetailsParts.length; i++) {
        placeDetails[placeDetailsParts[i]] = true;
    }
}


function fillTravelStylesDropdown(){
    for (var styleKey in travelStyles) {
        if (travelStyles.hasOwnProperty(styleKey)) {
            var div = document.getElementById("dropdownMenuTravelTypeContent");
            var button = document.createElement("button");
            button.setAttribute("id", styleKey);
            button.className = "dropdown-item";
            button.setAttribute("onclick", "fillTravelStyle(this.id)");
            var text = document.createTextNode(styleKey + "");
            button.appendChild(text);
            div.appendChild(button);
        }
    }
}

function fillPlaceDetailsDropdown() {
    for (var detailKey in placeDetails) {
        if (placeDetails.hasOwnProperty(detailKey)) {
            var div = document.getElementById("dropdownMenuPlaceTypeContent");
            var button = document.createElement("button");
            button.setAttribute("id", detailKey);
            button.className = "dropdown-item";
            button.setAttribute("onclick", "fillPlaceType(this.id)");
            var text = document.createTextNode(detailKey + "");
            button.appendChild(text);
            div.appendChild(button);
        }
    }
}

function applyFilters(){
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });

    resetGlobalValues();
    var firstDate = document.getElementById("datepicker-8");
    var secondDate = document.getElementById("datepicker-9");
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
    var oReq = new XMLHttpRequest();
    var requestUrl =  "backend/api.php?"+query2+query1+"&pathSpan="+pathSpan + travelTypeQuery;
    oReq.addEventListener("load", reqListner);
    oReq.open("GET", requestUrl);
    oReq.send();
}

function resetGlobalValues() {
    mainPaths = {};
    mainUsers = {};
    quickStat = {};
    travelStyles = {};
    polyLines = [];
}

function getDateFormat(strDate){
    var dateParts = strDate.split("/");
    return dateParts[2] + dateParts[0] + dateParts[1];
}

function getCenter(pathDataToCalc){
    var latTmp = 0;
    var lngTmp = 0;
    for (var i = 0; i < pathDataToCalc.length; i++){
        latTmp += pathDataToCalc[i]["lat"];
        lngTmp += pathDataToCalc[i]["lng"];
    }
    var centerCoord = {};
    centerCoord["lat"] = latTmp / pathDataToCalc.length;
    centerCoord["lng"] = lngTmp / pathDataToCalc.length;
    return centerCoord;
}

function maxLengthOfPaths(){
    for (var p in mainPaths) {
        if (mainPaths.hasOwnProperty(p)) {
            var pathToDrawOn = mainPaths[p];
            var numOfSamePaths = pathToDrawOn["SAME_PATH_NUM"];
            if (sliderProperties.maxNumberOfSamePaths < numOfSamePaths) {
                sliderProperties.maxNumberOfSamePaths = numOfSamePaths;
            }
        }
    }
}

function updateSlidersSettings() {
    var slider1 = document.getElementById("sliderNumberOfPaths");
    var slider2 = document.getElementById("sliderNumOfPathLength");
    // var slider3 = document.getElementById("sliderNumOfDay");
    maxLengthOfPaths();
    slider1.max = sliderProperties.maxNumberOfSamePaths;
    slider2.max = sliderProperties.maxLengthOfPath;
}

function updateDateSelections() {
    var date1 = dateProperties.minimumDate + "";
    var date2 = dateProperties.maximumDate + "";
    date1 = date1[4] + date1[5] + "/" + date1[6] + date1[7] + "/" + date1[0] + date1[1] + date1[2] + date1[3];
    date2 = date2[4] + date2[5] + "/" + date2[6] + date2[7] + "/" + date2[0] + date2[1] + date2[2] + date2[3];
    document.getElementById("datepicker-8").value = date1;
    document.getElementById("datepicker-9").value = date2;
}