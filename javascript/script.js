var map;
var mainPaths = {};
var mainUsers = {};
var quickStat = {};
var travelStyles = {};
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
    var travelStyleForUser = [];
    var travelTypeElements = document.getElementsByClassName("selected-travel-style");
    for (var btnI = 0; btnI < travelTypeElements.length; btnI++) {
        var travelText = travelTypeElements[btnI].innerHTML;
        travelStyleForUser.push(travelText);
    }

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
            //here we check if user has all necesery properties
            //TODO check after you add several and then add none, why points are not shown maybe because we dont event get any because CONTINUE
            else {
                var allGoodChecker = true;
                for (var sui = 0; sui < travelStyleForUser.length; sui++) {
                    if (!travleStyleUser.includes(travelStyleForUser[sui])) {
                        allGoodChecker = false;
                    }
                }
                if (!allGoodChecker) continue;

            }
            //Here we generate coords and create legit path for google maps
            for (var i = 0; i < paths.length; i++) {
                var path = paths[0];

                //Count and get longest path. This is for sliders setup
                if (sliderProperties.maxLengthOfPath < path.length && path.length > 1)
                    sliderProperties.maxLengthOfPath = path.length;

                var pathToDraw = [];
                var pathKey = "";
                for (var j = 0; j < path.length; j++) {
                    var point = path[j];
                    var lat = point["LAT"];
                    var lng = point["LNG"];
                    var date = parseInt(point["REVIEW_DATE"]);

                    //Calc max and min date
                    if (dateProperties.maximumDate < date)
                        dateProperties.maximumDate = date;
                    if (dateProperties.minimumDate > date)
                        dateProperties.minimumDate = date;

                    pathKey += lat + lng;
                    var coordTuple = {};
                    coordTuple.lat = parseFloat(lat);
                    coordTuple.lng = parseFloat(lng);
                    pathToDraw.push(coordTuple);

                    addMarker(coordTuple, point.PLACE_NAME);
                }
                //Here is calculated statistics for path
                //TODO add more elements for later analysis
                if (mainPaths[pathKey] === undefined){
                    var pathStatisticData = {};
                    pathStatisticData["SAME_PATH_NUM"] = 1;
                    pathStatisticData["PATH"] = pathToDraw;
                    mainPaths[pathKey] = pathStatisticData;
                }else {
                    var pathStatisticData2 = mainPaths[pathKey];
                    pathStatisticData2["SAME_PATH_NUM"] = pathStatisticData2["SAME_PATH_NUM"] + 1;
                    mainPaths[pathKey] = pathStatisticData2;
                }

            }
        }
    }

    if (firstLoad){
        //uncomment this line if you want to set data of sliders in style of data
        //updateSlidersSettings();
        fillTravelStylesDropdown();
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
    //TODO add filter for TRAVEL_STYLE also!!!!!
    //TODO CHECK ALL FILTERS AND CHECK LEGITNES OF IT
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
    this.userPath = new google.maps.Polyline({
        path: pathData,
        geodesic: true,
        strokeColor: colorLine(num),//"#0000FF",//randomColor(),
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    polyLines.push(this.userPath);

    google.maps.event.addListener(this.userPath, 'mouseover', function () {
        this.setOptions({
            strokeOpacity: 0.5,
            strokeWeight: 5
        });
    });
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

        modalPath.setMap(dialogMap);
        var modal = $('#myModal');
        modal.modal();
        modal.on('shown.bs.modal', function () {
            google.maps.event.trigger(dialogMap, "resize");
            dialogMap.setCenter(center);
        });
        alert(JSON.stringify(pathData));

    });
    google.maps.event.addListener(this.userPath, 'mouseout', function () {
        this.setOptions({
            strokeOpacity: 1,
            strokeWeight: 2
        });
    });

    // map.addListener(this.userPath, 'click', function(){
    //     console.log("test");
    // });
    this.userPath.setMap(map);
}

function testClick() {
    console.log("test");
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
    console.log(amount);
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
        query2 = "&dateTo" + getDateFormat(secondDate.value);
    }

    var pathSpan = slider3.value;
    var oReq = new XMLHttpRequest();
    var requestUrl =  "backend/api.php?"+query2+query1+"&pathSpan="+pathSpan;
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