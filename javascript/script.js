//Main variables
var map;
var mainPaths = {};
var mainUsers = {};
var quickStat = {};
var mainPlaces = {};

//Histogram data variables
var histoData1 = {};
var histoData2 = [];
var histoData3 = [];
var histoData4 = {};

//Relativity variables
var relativityPathRepetition = {};
var relativityPathLength = {};
var relativityLocalPlaces = {};

//Filter variables
var travelStyles = {};
var placeDetails = {};
var polyLines = [];
var markers = {};

//Request variables
var MAX_REQUEST_PAGES = 5;
var requestCounter = 0;
var responseMain = "";

//Map variables
var centerLat;
var centerLng;


var sliderProperties = {
    maxNumberOfSamePaths: 0,
    maxLengthOfPath: 0
};
var dateProperties = {
    minimumDate: 20181212,
    maximumDate: 0
};
var firstLoad = true;


function filterRequestListener() {
    //Here we receive response and we remove first and last curly braces
    if (this.responseText.length < 1000) {
        setLoadingText("Error occurred, check console");
        console.log("Error retrieving data: " + this.responseText);
    }
    if (responseMain === "")
        responseMain = this.responseText.slice(1, -1);
    else
        responseMain += "," + this.responseText.slice(1, -1);

    //We request new page of data or we create JSON and parse it
    if (requestCounter < MAX_REQUEST_PAGES) {
        requestCounter++;
        var percent = (requestCounter * 100) / MAX_REQUEST_PAGES;
        setLoadingText("data fetch at " + percent + "%");
        requestFilterData(requestCounter);
    } else {
        var content = JSON.parse("{" + responseMain + "}");
        responseMain = "";
        requestCounter = 0;
        parseResponse(content);
    }
}

function initRequestListener() {
    if (this.responseText.length < 1000) {
        setLoadingText("Error occurred, check console");
        console.log("Error retrieving data: " + this.responseText);
    }
    if (responseMain === "")
        responseMain = this.responseText.slice(1, -1);
    else
        responseMain += "," + this.responseText.slice(1, -1);
    if (requestCounter < MAX_REQUEST_PAGES) {
        requestCounter++;
        var percent = (requestCounter * 100) / MAX_REQUEST_PAGES;
        setLoadingText("data fetch at " + percent + "%");
        requestInitData(requestCounter);
    } else {
        var content = JSON.parse("{" + responseMain + "}");
        responseMain = "";
        requestCounter = 0;
        parseResponse(content);
    }
}


/** here we create path and put them together as key
 * value must be statistic of that path
 * that is number of users, type of users, but just unique types
 * then length of that path and dates of that path because users can
 * go through one path different times
 */
function parseResponse(data) {
    setLoadingText("analyzing data (parsing)");
    // Below for loop is for travel type which was selected to be used in paths
    var travelStyleForUser = getTravelTypeSelectedArray();

    // Below for loop is for place type which was selected to be filtered in later loop
    var placeTypeSelected = getPlaceTypeSelectedArray();

    //Here we read paths which we get from call response
    var countTest = 0;
    for (var uidKey in data) {
        countTest++;
        if (data.hasOwnProperty(uidKey)) {
            var tmpObject = data[uidKey];
            mainUsers[uidKey] = tmpObject;
            var paths = tmpObject["PATHS"];

            //Saving values to use it in dialog of path statistic
            var travleStyleUser = tmpObject["TRAVEL_STYLE"];
            var pathStatisticGender = tmpObject["GENDER"];
            var pathStatisticAge = tmpObject["AGE"];

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
                var pathIsLocalyGood = false;
                var pathKey = "";
                for (var j = 0; j < path.length; j++) {
                    var point = path[j];
                    collectPlaceData(point, travleStyleUser, pathStatisticGender, pathStatisticAge);
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
                        for (var pointTypeIndex = 0; pointTypeIndex < placeTypeSelected.length; pointTypeIndex++) {
                            if (placeDetailsPoint.indexOf(placeTypeSelected[pointTypeIndex]) !== -1) {
                                pathContainsCorrectPoints = true;
                                break;
                            }
                        }
                        //Here we check if this is flaged path and mark path as flaged
                        if (relativityLocalPlaces[lat + "," + lng] === true)
                            pathIsLocalyGood = true;
                    }
                    pathKey += lat + lng;
                    var coordTuple = {};
                    coordTuple.lat = parseFloat(lat);
                    coordTuple.lng = parseFloat(lng);
                    pathToDraw.push(coordTuple);

                    if (relativityLocalPlaces[lat + "," + lng] === true)
                        addMarker(coordTuple, point.PLACE_NAME, true);
                    else addMarker(coordTuple, point.PLACE_NAME, false);
                }

                //Here we check if that path contains marker which is flaged, if so we let it through otherwise not
                //Also we let it through if nthere is no markers, then it must go through
                if (!pathIsLocalyGood && countRelativeLocalPlaces(relativityLocalPlaces) > 0) continue;

                /**Here is calculated statistics for path which is shown in dialog if you click on path*/
                //First we calculate num of path repeated
                //Second we calculate num of each travel type for this path
                //Third we calculate num of gender for that path
                //Fourth we calculate num of age for that path
                //TODO add more elements for later analysis
                if (mainPaths[pathKey] === undefined && pathContainsCorrectPoints) {
                    var pathStatisticData = {};
                    var styleStatisticData = {};
                    var genderStatisticData = {};
                    var ageStatisticData = {};
                    pathStatisticData["SAME_PATH_NUM"] = 1;
                    pathStatisticData["PATH"] = pathToDraw;
                    genderStatisticData[pathStatisticGender] = 1;
                    ageStatisticData[pathStatisticAge] = 1;
                    var travelTypeStat = travleStyleUser.split(" & ");
                    for (var tmpI = 0; tmpI < travelTypeStat.length; tmpI++) {
                        styleStatisticData[travelTypeStat[tmpI]] = 1;
                    }
                    pathStatisticData["USERS_STATISTIC_GENDER"] = genderStatisticData;
                    pathStatisticData["USERS_STATISTIC_AGE"] = ageStatisticData;
                    pathStatisticData["TRAVEL_STYLE"] = styleStatisticData;
                    mainPaths[pathKey] = pathStatisticData;

                } else if (pathContainsCorrectPoints) {
                    var pathStatisticData2 = mainPaths[pathKey];
                    var tmpStat = pathStatisticData2["TRAVEL_STYLE"];
                    travelTypeStat = travleStyleUser.split(" & ");
                    for (var tmpJ = 0; tmpJ < travelTypeStat.length; tmpJ++) {
                        if (tmpStat[travelTypeStat[tmpJ]] === undefined) {
                            tmpStat[travelTypeStat[tmpJ]] = 1;
                        } else {
                            tmpStat[travelTypeStat[tmpJ]] = tmpStat[travelTypeStat[tmpJ]] + 1;
                        }
                    }
                    var genderStat = pathStatisticData2["USERS_STATISTIC_GENDER"];
                    if (genderStat[pathStatisticGender] === undefined) genderStat[pathStatisticGender] = 1;
                    else genderStat[pathStatisticGender] = genderStat[pathStatisticGender] + 1;
                    pathStatisticData2["USERS_STATISTIC_GENDER"] = genderStat;

                    var ageStat = pathStatisticData2["USERS_STATISTIC_AGE"];
                    if (ageStat[pathStatisticAge] === undefined) ageStat[pathStatisticAge] = 1;
                    else ageStat[pathStatisticAge] = ageStat[pathStatisticAge] + 1;
                    pathStatisticData2["USERS_STATISTIC_AGE"] = ageStat;

                    pathStatisticData2["TRAVEL_STYLE"] = tmpStat;
                    pathStatisticData2["SAME_PATH_NUM"] = pathStatisticData2["SAME_PATH_NUM"] + 1;
                    mainPaths[pathKey] = pathStatisticData2;
                }

            }
        }
    }

    if (firstLoad) {
        //uncomment this line if you want to set data of sliders dynamicly not staticly which are set in HTML
        //updateSlidersSettings();
        fillTravelStylesDropdown();
        fillPlaceDetailsDropdown();
        updateDateSelections();
    }
    if (!firstLoad) {
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

            //Collecting data for relativity for same path filter
            if (numOfSamePaths >= minNumOfSamePaths && path2.length >= minNumOfLength) {
                relativityPathRepetition[numOfSamePaths] = true;
                relativityPathLength[path2.length] = true;
            }
            if (firstLoad)
                drawGraph(path2, numOfSamePaths);
            else if (!isRelativeToggleChecked() && numOfSamePaths >= minNumOfSamePaths && path2.length >= minNumOfLength)
                drawGraph(path2, numOfSamePaths);
        }
    }
    firstLoad = false;

    if (isRelativeToggleChecked()) {
        runAndDrawRelativeData(mainPaths);
    }

    hideLoadingLayout();
    console.log("Number of uids " + countTest);
    //uncomment below lines if you want to collect data for histograms
    // getHistoData()
    // getHistoData4();
    // getHistoData3();
}

/**
 *
 * @param coords
 * @param placeName
 * @param isFlag is there so we can set proper flag after user apply filters, so flag stays there
 */
function addMarker(coords, placeName, isFlag) {

    var markerKey = coords.lat + "," + coords.lng;
    var marker = new google.maps.Marker({
        position: coords,
        title: placeName
    });
    //We save lat and lng, so we can create key for relative place
    marker.LAT = coords.lat;
    marker.LNG = coords.lng;
    marker.localFlag = isFlag;
    if (isFlag) changeMarkerIcon(marker, true);
    marker.addListener('click', function () {
        var modal = $('#myModal2');
        modal.modal();


        var div = document.createElement("div");
        var input = document.createElement("input");
        var label = document.createElement("label");

        div.className = "align-right";
        input.className = "cbx hidden";
        input.setAttribute("id", "pointSelection" + marker.lat + "" + marker.lng);
        input.setAttribute("type", "checkbox");
        label.className = "lbl";
        label.setAttribute("for", "pointSelection" + marker.lat + "" + marker.lng);
        div.appendChild(input);
        div.appendChild(label);

        var label0 = document.createElement("label");
        label0.className = "align-left";
        label0.appendChild(document.createTextNode("Mark the place as important in the path"));

        document.getElementById("modal-checkbox-place").innerHTML = null;
        document.getElementById("modal-checkbox-place").appendChild(label0);
        document.getElementById("modal-checkbox-place").appendChild(div);

        var markAsImportantCheckbox = document.getElementById("pointSelection" + marker.lat + "" + marker.lng);
        markAsImportantCheckbox.checked = marker.localFlag;
        markAsImportantCheckbox.addEventListener("change", function () {
            if (this.checked) {
                marker.localFlag = true;
                //We add place to relative local places
                relativityLocalPlaces[marker.LAT + "," + marker.LNG] = true;
                changeMarkerIcon(marker, true);
            } else {
                marker.localFlag = false;
                //We remove place from relative local places
                relativityLocalPlaces[marker.LAT + "," + marker.LNG] = undefined;
                changeMarkerIcon(marker, false);
            }
        });

        console.log(mainPlaces[marker.LAT + "," + marker.LNG]);
    });

    if (markers[markerKey] !== undefined) return;

    markers[markerKey] = marker;
    if (isShowMarkersChecked())
        markers[markerKey].setMap(map);
    else markers[markerKey].setMap(null);


}

// Change markers icon
function changeMarkerIcon(marker, setMarker) {
    var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
    if (!setMarker) image = null;
    marker.setIcon(image);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var markerKey in markers) {
        if (markers.hasOwnProperty(markerKey)) {
            markers[markerKey].setMap(map);
        }
    }
    // for (var i = 0; i < markers.length; i++) {
    //     markers[i].setMap(map);
    // }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

function drawGraph(pathData, num) {

    // uncomment below line if you want to collect histogram data
    // collectHistoData(pathData, num);

    this.userPath = new google.maps.Polyline({
        path: pathData,
        geodesic: true,
        strokeColor: pathColor(num),//colorLine(num),//"#0000FF",//randomColor(),
        strokeOpacity: 1.0,
        strokeWeight: getPathStroke(num)
    });

    polyLines.push(this.userPath);

    //MOUSEOVER
    google.maps.event.addListener(this.userPath, 'mouseover', function () {
        this.setOptions({
            strokeOpacity: 0.5,
            strokeWeight: this.strokeWeight + 2
        });
    });

    //ONCLICK
    google.maps.event.addListener(this.userPath, 'click', function () {
        // alert(JSON.stringify(pathData));
        // var path = JSON.stringify(pathData);
        var modalPath = new google.maps.Polyline({
            path: pathData,
            geodesic: true,
            strokeColor: pathColor(num),//colorLine(num),//"#0000FF",//randomColor(),
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        var center = getCenter(pathData);
        var dialogMap = new google.maps.Map(document.getElementById('mapDialog'), {
            zoom: 12,
            center: center,
            // center: {lat: 46.0548178, lng: 14.5042642},
            mapTypeId: 'terrain'
        });

        for (var i = 0; i < pathData.length; i++) {
            var dialogPathCoords = pathData[i];
            new google.maps.Marker({
                position: dialogPathCoords,
                label: {
                    text: getDialogMapMarkerLabel(i, pathData.length),
                    color: "#f2f2f2"
                },
                map: dialogMap
            });

        }

        var pathKey = generateKeyForPath(pathData);
        var pathHistoData = mainPaths[pathKey];
        console.log("Path info data");
        console.log(pathHistoData);

        modalPath.setMap(dialogMap);
        var modal = $('#myModal');
        modal.modal();
        modal.on('shown.bs.modal', function () {
            google.maps.event.trigger(dialogMap, "resize");
            dialogMap.setCenter(center);
            showPathInfoModal(pathHistoData);
        });
        // alert(JSON.stringify(pathData));

    });

    //MOUSEOUT
    google.maps.event.addListener(this.userPath, 'mouseout', function () {
        this.setOptions({
            strokeOpacity: 1,
            strokeWeight: this.strokeWeight - 2
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
    } else {
        histoData1[pathLength] = amountOfUserVisitThatPath + histoData1[pathLength];
    }


}

function getHistoData() {
    //here is data retriever for histoData2
    var output = "dolzina_poti, stevilo_obiskov_te_poti\n";
    for (var i = 0; i < histoData2.length; i++) {
        output += histoData2[i][0] + ", " + histoData2[i][1] + "\n"
    }
    alert("Check Console");
    console.log(output);
}

function getHistoData4() {
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
            if (mainPaths[path]["PATH"].length > 1)
                output += path + ", " + mainPaths[path]["SAME_PATH_NUM"] + "\n";
        }
    }
    alert("Check histoData3");
    console.log(output);
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        //Ljubljana
        // center: {lat: 46.0548178, lng: 14.5042642},

        //Vienna
        center: {lat: 48.2087716, lng: 16.3708347},

        mapTypeId: 'terrain'
    });
    google.maps.event.addListener(map, 'idle', function () {
        console.log("Map is now idle");
    });

    showLoadingLayout();
    requestInfoData();
}

function requestInfoData() {
    setLoadingText("calculating center...");
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", infoRequestListener);
    oReq.open("GET", "" +
        "backend/infoapi.php");
    oReq.send();
}

function infoRequestListener() {
    var content = JSON.parse(this.responseText);
    centerLat = content["AVG_LAT"];
    centerLng = content["AVG_LNG"];
    MAX_REQUEST_PAGES = content["REQUEST_NUM"] - 1;

    var center = {lat: centerLat, lng: centerLng};
    map.setCenter(center);

    setLoadingText("fetching data...");
    if (firstLoad)
        requestInitData(0);
    else requestFilterData(0);
}

function requestInitData(page) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initRequestListener);
    oReq.open("GET", "" +
        "backend/api.php?page=" + page);
    oReq.send();
}

// collectTravelTypes("Like a Local & History Buff & Art and Architecture Lover");
function collectTravelTypes(nameOfTravelType) {
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

function fillTravelStylesDropdown() {
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

function applyFilters() {
    showLoadingLayout();
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        //Vienna center
        center: {lat: 48.2087716, lng: 16.3708347},
        //Ljubljana
        // center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });
    resetGlobalValues();
    requestInfoData();
}

function requestFilterData(page) {
    var requestUrl = requestPerPartes(page);
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", filterRequestListener);
    oReq.open("GET", requestUrl);
    oReq.send();
}

function resetGlobalValues() {
    mainPlaces = {};
    mainPaths = {};
    mainUsers = {};
    quickStat = {};
    travelStyles = {};
    polyLines = [];
    markers = {};
    relativityPathLength = {};
    relativityPathRepetition = {};
    requestCounter = 0;
    responseMain = "";
}

function getDateFormat(strDate) {
    var dateParts = strDate.split("/");
    return dateParts[2] + dateParts[0] + dateParts[1];
}

function getCenter(pathDataToCalc) {
    var latTmp = 0;
    var lngTmp = 0;
    for (var i = 0; i < pathDataToCalc.length; i++) {
        latTmp += pathDataToCalc[i]["lat"];
        lngTmp += pathDataToCalc[i]["lng"];
    }
    var centerCoord = {};
    centerCoord["lat"] = latTmp / pathDataToCalc.length;
    centerCoord["lng"] = lngTmp / pathDataToCalc.length;
    return centerCoord;
}

function maxLengthOfPaths() {
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


function collectPlaceData(place, travleStyleUser, pathStatisticGender, pathStatisticAge) {
    var placeKey = generatePlaceKey(place);
    var tmpData = mainPlaces[placeKey];
    if (tmpData === undefined) tmpData = {};
    if (tmpData["VISITOR"] === undefined) tmpData["VISITOR"] = 1;
    else tmpData["VISITOR"] = tmpData["VISITOR"] + 1;

    var genders = tmpData["GENDER"];
    if (genders === undefined) genders = {};
    if (genders[pathStatisticGender] === undefined) genders[pathStatisticGender] = 1;
    else genders[pathStatisticGender] = genders[pathStatisticGender] + 1;
    tmpData["GENDER"] = genders;
    genders = null;


    var tmpStat = tmpData["TRAVEL_STYLE"];
    if (tmpStat === undefined) tmpStat = {};
    var tmpStatParts = travleStyleUser.split(" & ");
    for (var i = 0; i < tmpStatParts.length; i++) {
        if (tmpStat[tmpStatParts[i]] === undefined) tmpStat[tmpStatParts[i]] = 1;
        else tmpStat[tmpStatParts[i]] = tmpStat[tmpStatParts[i]] + 1;
    }
    tmpData["TRAVEL_STYLE"] = tmpStat;
    tmpStat = null;
    tmpStatParts = null;

    var ages = tmpData["AGE"];
    if (ages === undefined) ages = {};
    if (ages[pathStatisticAge] === undefined) ages[pathStatisticAge] = 1;
    else ages[pathStatisticAge] = ages[pathStatisticAge] + 1;
    tmpData["AGE"] = ages;
    ages = null;

    mainPlaces[placeKey] = tmpData;
    tmpData = null;
}
