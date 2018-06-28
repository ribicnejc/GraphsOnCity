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
var histoRepetitions = {};
//dolžine poti dej notri pa natred iz njih histo
var histoRepetitions2 = [];

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
    maximumDate: 20001212
};
var firstLoad = true;


function filterRequestListener() {
    //Here we receive response and we remove first and last curly braces
    if (this.responseText === "[]") {
        console.log("request has not data")
    } else if (this.responseText.length < 1000) {
        setLoadingText("Error occurred, check console");
        console.log("Error retrieving data: " + this.responseText);
    }
    if (responseMain === "" && this.responseText !== "[]")
        responseMain = this.responseText.slice(1, -1);
    else if (this.responseText !== "[]")
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
    //Here we receive response and we remove first and last curly braces
    if (this.responseText === "[]") {
        console.log("request has not data")
    } else if (this.responseText.length < 1000) {
        setLoadingText("Error occurred, check console");
        console.log("Error retrieving data: " + this.responseText);
    }
    if (responseMain === "" && this.responseText !== "[]")
        responseMain = this.responseText.slice(1, -1);
    else if (this.responseText !== "[]")
        responseMain += "," + this.responseText.slice(1, -1);

    //We request new page of data or we create JSON and parse it
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

            //Collect any different travel style
            collectTravelTypes(travleStyleUser);

            //Here we generate coords and create legit path for google maps
            for (var i = 0; i < paths.length; i++) {
                var path = paths[i];


                //Count and get longest path. This is for sliders setup
                if (sliderProperties.maxLengthOfPath < path.length && path.length > 1)
                    sliderProperties.maxLengthOfPath = path.length;

                var pathToDraw = [];
                var pathContainsCorrectPoints = false;
                var pathIsLocalyGood = false;
                for (var j = 0; j < path.length; j++) {
                    var point = path[j];
                    collectPlaceData(point, travleStyleUser, pathStatisticGender, pathStatisticAge);
                    var lat = point["LAT"];
                    var lng = point["LNG"];
                    var placeDetailsPoint = point["PLACE_DETAILS"];
                    var date = parseInt(point["REVIEW_DATE"]);

                    //Collect all place details for drop down
                    collectPlaceDetails(placeDetailsPoint);

                    if (firstLoad) {
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

                //Generate path key so we can save it as object reference to path stat
                var pathKey = generateKeyForPath(pathToDraw);

                /** MERGE PATH IN SAME LINE (FRONT AND BACK MERGING)
                 * Logic here is: if some path does not exist in mainPaths, invert it,
                 * because maybe inverted path exists if path do exist, then save it.
                 */
                if (isMergePathFrontBackChecked()) {
                    if (mainPaths[pathKey] === undefined) {
                        pathToDraw = invertPath(pathToDraw);
                        //regenerate path key with inverted path
                        pathKey = generateKeyForPath(pathToDraw);
                    }
                }


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
                    pathStatisticData["PATH_NAME"] = generatePathName(pathToDraw);
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

    fillTravelStylesDropdown();
    fillPlaceDetailsDropdown();
    if (firstLoad) {
        //uncomment this line if you want to set data of sliders dynamicly not staticly which are set in HTML
        //updateSlidersSettings();
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


    //TODO below
    // sortPathStrength(mainPaths, true);
    //Sort paths so the strongest are lowest
    //Sort paths so the strongest are highest


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
        input.setAttribute("id", "pointSelection" + marker.LAT + "" + marker.LNG);
        input.setAttribute("type", "checkbox");
        label.className = "lbl";
        label.setAttribute("for", "pointSelection" + marker.LAT + "" + marker.LNG);
        div.appendChild(input);
        div.appendChild(label);

        var label0 = document.createElement("label");
        label0.className = "align-left";
        label0.appendChild(document.createTextNode("Mark the place as important in the path"));

        document.getElementById("modal-checkbox-place").innerHTML = null;
        document.getElementById("modal-checkbox-place").appendChild(label0);
        document.getElementById("modal-checkbox-place").appendChild(div);

        var markAsImportantCheckbox = document.getElementById("pointSelection" + marker.LAT + "" + marker.LNG);
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

        console.log("Place key: " + marker.LAT + "," + marker.LNG);
        console.log(mainPlaces[marker.LAT + "," + marker.LNG]);
        modal.LAT = marker.LAT;
        modal.LNG = marker.LNG;

        setPlaceDialogData(mainPlaces[generatePlaceKey(marker)], marker.title);

        modal.one('shown.bs.modal', function () {
            console.log("Place key after modal load:" + marker.LAT + "," + marker.LNG);
            showPlaceInfoModal(mainPlaces[marker.LAT + "," + marker.LNG]);
        });
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

var analysisData = {};
var outputData = {};

function getParticularPathName() {
    var tmp = Object.keys(analysisData);
    for (var i = 0; i < tmp.length; i++) {
        var flowKey = tmp[i];
        var flow = analysisData[flowKey];

        if (flow.PATH_NAME === "Historic Center of Vienna - Tiergarten Schoenbrunn - Zoo Vienna - ") {
            console.log(flow);
        }
        if (flow.PATH_NAME === "Zoo Vienna - Tiergarten Schoenbrunn - Historic Center of Vienna - ") {
            console.log(flow);
        }
    }
}

function getAmountOfFlows() {
    console.log("Amount of flows: " + Object.keys(analysisData).length);
}

function getAmountOfParticularLength(n) {
    var length = 0;
    var tmp = Object.keys(analysisData);
    for (var i = 0; i < tmp.length; i++) {
        var flowKey = tmp[i];
        var flow = analysisData[flowKey];
        if (flow.SAME_PATH_NUM === n)
            length++;
    }
    console.log("Amount of length " + n + ": " + length);
}

function getAveragePathLength() {
    var length = 0;
    var tmp = Object.keys(analysisData);
    for (var i = 0; i < tmp.length; i++) {
        var flowKey = tmp[i];
        var flow = analysisData[flowKey];
        length += flow.PATH.length;
    }
    console.log("Average path length: " + length / tmp.length)
}


function dialogForGirlsAndGuys() {

    var girlsPath = {};
    var mensPath = {};
    var tmp = Object.keys(analysisData);
    for (var j = 0; j < tmp.length; j++) {
        var flowKey = tmp[j];
        var flow = analysisData[flowKey];
        if (flow.SAME_PATH_NUM === 113) {
            girlsPath = flow.PATH;
        }
        if (flow.PATH_NAME === "Ljubljana Castle - Julija (#restaurant) - ") {
            mensPath = flow.PATH;
        }
    }


    var malePath = new google.maps.Polyline({
        path: mensPath,
        geodesic: true,
        strokeColor: "#0000ff",//colorLine(num),//"#0000FF",//randomColor(),
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    var femalePath = new google.maps.Polyline({
        path: girlsPath,
        geodesic: true,
        strokeColor: "#ff00ff",//colorLine(num),//"#0000FF",//randomColor(),
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    var center = getCenter(girlsPath);
    var dialogMap = new google.maps.Map(document.getElementById('mapDialog'), {
        zoom: 12,
        center: center,
        // center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });

    for (var i = 0; i < mensPath.length; i++) {
        var dialogPathCoords = mensPath[i];
        new google.maps.Marker({
            position: dialogPathCoords,
            label: {
                text: getDialogMapMarkerLabel(i, mensPath.length),
                color: "#f2f2f2"
            },
            map: dialogMap
        });
    }


    for (var k = 0; k < girlsPath.length; k++) {
        dialogPathCoords = girlsPath[k];
        new google.maps.Marker({
            position: dialogPathCoords,
            label: {
                text: getDialogMapMarkerLabel(k, girlsPath.length),
                color: "#f2f2f2"
            },
            map: dialogMap
        });
    }
    // var pathKey = generateKeyForPath(pathData);
    // var pathHistoData = mainPaths[pathKey];
    // console.log("Path info data");
    // console.log(pathHistoData);

    malePath.setMap(dialogMap);
    femalePath.setMap(dialogMap);
    var modal = $('#myModal');
    modal.modal();
    modal.one('shown.bs.modal', function () {
        google.maps.event.trigger(dialogMap, "resize");
        dialogMap.setCenter(center);
    });
}

function getAnalysis() {
    console.log("Amount of flows: " + Object.keys(analysisData).length);
    outputData = {};
    for (var i = 0; i < Object.keys(analysisData).length; i++) {
        var flowKey = Object.keys(analysisData)[i];
        var flow = analysisData[flowKey];
        var genderRation = {};

        genderRation["MALE"] = flow.USERS_STATISTIC_GENDER.male / (flow.USERS_STATISTIC_GENDER.male + flow.USERS_STATISTIC_GENDER.female);
        genderRation["FEMALE"] = flow.USERS_STATISTIC_GENDER.female / (flow.USERS_STATISTIC_GENDER.male + flow.USERS_STATISTIC_GENDER.female);
        flow["USERS_STATISTIC_GENDER_RATIO"] = genderRation;

        var ageRatio = {};
        var ageSum = 0;
        for (var j = 0; j < Object.keys(flow.USERS_STATISTIC_AGE).length; j++) {
            if (Object.keys(flow.USERS_STATISTIC_AGE)[j] === "none") continue;
            ageSum += flow.USERS_STATISTIC_AGE[Object.keys(flow.USERS_STATISTIC_AGE)[j]];
        }
        for (var k = 0; k < Object.keys(flow.USERS_STATISTIC_AGE).length; k++) {
            if (Object.keys(flow.USERS_STATISTIC_AGE)[k] === "none") continue;
            ageRatio[Object.keys(flow.USERS_STATISTIC_AGE)[k]] = flow.USERS_STATISTIC_AGE[Object.keys(flow.USERS_STATISTIC_AGE)[k]] / ageSum;
        }
        flow["USERS_STATISTIC_AGE_RATIO"] = ageRatio;

        outputData[flow.SAME_PATH_NUM + " " + flow.PATH_NAME] = flow;
    }
    console.log(outputData);
}


function addNewCoords() {

    var markers3 = "46.0511449, 14.506256600000029, Triple Bridge (Tromostovje) Ljubljana: 46.0547242, 14.494829200000027, Tivoli Park Ljubljana: 46.0517229, 14.506071700000007, Franciscan Church (Franciskanska cerkev) Ljubljana: 46.0515696, 14.506244100000004, Preseren Square Ljubljana: 46.0105268, 14.464770600000065, River Ljubljanica Kanal Ljubljana: 46.0521098, 14.509190399999966, Ljubljana Old Town Ljubljana: 46.0563594, 14.515778700000055, Metelkova Ljubljana: 46.0507536, 14.508083599999964, Cathedral of St. Nicholas (Stolnica Sv. Nikolaja) Ljubljana: 46.0518861, 14.510379300000068, Dragon Bridge (Zmajski Most) Ljubljana: 46.0507461, 14.509675300000026, Vodnik Square (Vodnikov trg) Ljubljana: 46.0497344, 14.505630800000063, Cankarjevo nabrezje Ljubljana: 46.050075, 14.509673199999952, Ljubljana Castle Funicular Ljubljana: 46.0501911, 14.503766600000063, Congress Square (Kongresni trg) Ljubljana: 46.0493671, 14.506409399999939, Mestni Trg Ljubljana: 46.0539366, 14.499356900000066, Sts. Cyril and Methodius Church Ljubljana: 46.0475396, 14.506272299999978, Old Square (Stari trg) Ljubljana: 46.049623, 14.503403700000035, Museum of Illusions Ljubljana: 46.0590334, 14.49528680000003, National Museum of Contemporary History (Muzej Novejse Zgodovine Slovenije) Ljubljana: 46.0532605, 14.503647900000033, Skyscraper (Neboticnik) Ljubljana: 46.0510381, 14.510393300000032, Tourist Information Centre Ljubljana Ljubljana: 46.051399, 14.509745899999984, Central Market Ljubljana: 46.0527405, 14.472088100000065, ZOO Ljubljana Ljubljana: 46.0461179, 14.508426500000041, Gornji Trg Ljubljana: 46.0598057, 14.49892890000001, Union Experience Ljubljana: 46.0516961, 14.508773900000051, Butcher's Bridge Ljubljana: 46.0488852, 14.508373799999958, Ljubljana Castle Ljubljana: 46.051992, 14.499683000000005, National Museum of Slovenia Ljubljana: 46.0500973, 14.507047599999964, Fountain of Three Carniolan Rivers (Vodnjak treh kranjskih rek) Ljubljana: 46.0569465, 14.505751499999974, Hauptmannova Hisa Ljubljana: 46.0484252, 14.505524499999979, Shoemaker's Bridge (Cevljarski Most) Ljubljana: 46.0423824, 14.502374499999974, Plecnik House Ljubljana: 46.0475198, 14.503967099999954, National and University Library Ljubljana: 46.04952249999999, 14.504651700000068, Slovenian Philharmonic Hall (Slovenska Filharmonija) Ljubljana: 46.052609, 14.500807099999975, Opera Ljubljana: 46.0675, 14.528408200000058, Zale Cemetery Ljubljana: 46.052616, 14.510880000000043, House of Experiments - Hisa eksperimentov Ljubljana: 46.0498518, 14.50713440000004, Town Hall (Magistrat) Ljubljana: 46.052814, 14.506786, Cooperative Business Bank Ljubljana: 46.0624972, 14.502835600000026, Railway Museum Ljubljana: 46.0549694, 14.5162014, Slovene Ethnographic Museum Ljubljana: 46.0540536, 14.500260700000013, National Gallery (Narodna Galerija) Ljubljana: 46.0675932, 14.541733000000022, Minicity Ljubljana Ljubljana: 46.0473017, 14.49327900000003, Technical Museum of Slovenia Ljubljana: 46.04696819999999, 14.504094699999996, City Museum of Ljubljana Ljubljana: 46.0498539, 14.502268500000014, Ursuline Church of the Holy Trinity Ljubljana: 46.0511287, 14.508176400000025, Odprta kuhna Ljubljana: 46.053196, 14.498862000000031, Modern Gallery (Moderna Galerija) Ljubljana: 46.0460216, 14.50759149999999, Church of St. James Ljubljana: 46.040254, 14.514321999999993, University Botanic Gardens Ljubljana Ljubljana: 46.0463229, 14.5039577, Monastery of the Holy Cross Summer Theater (Krizanke Poletno Gledalisce) Ljubljana: 46.049823, 14.499123999999938, Cankarjev dom (Cultural and Congress Centre) Ljubljana: 46.0505243, 14.507950199999982, Cyril Methodius Square (Ciril-Metodov trg) Ljubljana: 46.0471116, 14.502831900000047, French Revolution Square (Trg Francoske Revolucije) Ljubljana: 46.0540417, 14.504720200000065, Planetarij Ljubljana Ljubljana: 46.0470664, 14.505349600000045, Breg embankment Ljubljana: 46.0682176, 14.546139400000015, CityPark Shopping Center Ljubljana: 46.0502092, 14.510142200000018, Museum of Puppetry Ljubljana: 46.0569465, 14.505751499999974, Snopc o' tecca Ljubljana: 46.0464664, 14.504403300000035, Krizevniska ulica Ljubljana: 46.0475198, 14.503967099999954, Seminary Palace and Library Ljubljana: 46.0569465, 14.505751499999974, Public Loan Bank Building Ljubljana: 46.0123199, 14.505942799999957, Church of St. Michael Ljubljana: 46.0462012, 14.506546299999968, Galerija Fotografija Ljubljana: 46.051708, 14.50499000000002, City Savings Bank Building Ljubljana: 46.0457026, 14.498545700000022, Roman Wall Ljubljana: 46.055707, 14.517032500000028, Museum of Contemporary Art Metelkova (MSUM) Ljubljana: 46.0804912, 14.524214799999982, Stozice Stadium Ljubljana: 46.0477101, 14.506223200000022, Hercules Fountain Ljubljana: 46.0517229, 14.506071700000007, St. Francis Church Ljubljana: 46.0569465, 14.505751499999974, Schweigerjeva House Ljubljana: 46.05775550000001, 14.509578899999951, Avtobusna postaja Ljubljana Ljubljana: 46.0463229, 14.5039577, Krizanke Church Ljubljana: 46.0491938, 14.504155200000014, Universita di Lubiana Ljubljana: 46.12995420000001, 14.463843600000018, Romarska c. Matere Bozje Ljubljana: 46.0544525, 14.507220700000062, Miklosiceva Street Ljubljana: 46.0443931, 14.505722999999989, Hradecky Bridge Ljubljana: 46.0514956, 14.506606000000033, Ljubljana Central Pharmacy Building Ljubljana: 46.0528835, 14.517267700000048, Path of Remembrance and Comradeship Ljubljana: 46.0434178, 14.502173500000026, Trnovo Bridge Ljubljana: 46.0484223, 14.504945399999997, Galerija Hest Ljubljana: 46.0463234, 14.505052699999965, Tiporenesansa Ljubljana: 46.0617092, 14.508353700000043, Ljubljana Exhibition and Convention Centre Ljubljana: 45.956148, 14.807107299999984, Sticna Mansion Ljubljana: 46.0569465, 14.505751499999974, Retro swimming pool Ilirija Ljubljana: 46.0507317, 14.498474100000067, Ravnikar Gallery Space Ljubljana: 46.04292909999999, 14.50216649999993, Trnovo Church Ljubljana: 46.0397316, 14.511605400000008, Park Spica Ljubljana: 46.0569465, 14.505751499999974, Emonan House Ljubljana: 46.0502968, 14.5181012, Ljubljanica River Barrier Ljubljana: 46.063742, 14.549436000000014, The Land of Ice Ljubljana: 46.0514312, 14.508450400000015, DobraVaga Gallery Ljubljana: 46.05087, 14.500416900000005, Republic Square (Trg Republike) Ljubljana: 46.05048, 14.563406999999984, Museum of Architecture and Design (MAO) Ljubljana: 46.0501866, 14.505955299999982, Fish Square (Ribji trg) Ljubljana: 46.054831, 14.5126001, Church of the Sacred Heart of Jesus Ljubljana: 46.05201599999999, 14.518720600000051, St. Peter's Parish Church Ljubljana: 46.0462646, 14.508710800000017, St Florian's Church Ljubljana: 46.0569465, 14.505751499999974, Citizen of Emona Statue Ljubljana: 46.0562112, 14.506070000000022, LPP Buses Ljubljana: 46.0513834, 14.506309699999974, France Preseren statue Ljubljana: 46.051399, 14.509745899999984, Plecnik's Covered Market Ljubljana: 46.05247070000001, 14.498889200000008, Embassy of the United States of America Ljubljana: 46.04788509999999, 14.50103480000007, The Jakopic Gallery Ljubljana: 46.0498539, 14.502268500000014, Znamenje svete Trojice Ljubljana: 46.0569465, 14.505751499999974, Sava River Ljubljana: 46.0569465, 14.505751499999974, Exhibition of torture devices Ljubljana: 46.0488852, 14.508373799999958, Castle Chapel of St George Ljubljana: 46.1013781, 14.464944100000025, J&B VINOTEKA Bianca Visintin SP Ljubljana: 46.0848799, 14.484037100000023, Urbanc Building Ljubljana: 46.0494037, 14.504240799999934, Fontana Evropa Ljubljana: 46.0552348, 14.516903599999978, National Museum of Slovenia - Metelkova Ljubljana: 46.0488852, 14.508373799999958, Pentagonal Tower Ljubljana: 46.0569465, 14.505751499999974, Cheese & Deli Shop Gligora Ljubljana: 46.0631831, 14.494300000000067, St. Bartholomew's Church Ljubljana: 46.042091, 14.4941556, Kolezija Swimming Pool Ljubljana: 46.0416094, 14.508492299999943, Trnovski Pristan Embankment Ljubljana: 46.0465569, 14.504276900000036, Jewish Cultural Center Museum Ljubljana: 46.067308, 14.46911380000006, Koseze Pond Ljubljana: 46.0569465, 14.505751499999974, Marijin steber Ljubljana: 46.04292909999999, 14.50216649999993, Cerkev sv. Janeza Krstnika Ljubljana: 46.0546223, 14.493001899999967, International Centre of Graphic Arts (MGLC) Ljubljana: 46.05423, 14.506485200000043, Miklosicev Park Ljubljana: 46.0558613, 14.476975100000004, Roznik Hill Ljubljana: 46.04948050000001, 14.506529, City Art Gallery Ljubljana: 46.04773369999999, 14.493041700000049, Tobacco 001 Ljubljana: 46.046962, 14.506734999999935, Skuc Gallery Ljubljana: 46.0463264, 14.506659099999979, Levstikov trg Square Ljubljana: 46.05025699999999, 14.502349999999979, Slovenski solski muzej Ljubljana: 46.0569465, 14.505751499999974, Spomenik Edvardu Kardelju Ljubljana: 46.05025699999999, 14.502349999999979, Slovenia School Museum Ljubljana: 46.0663736, 14.508198300000004, Zupnijska cerkev Sv. Cirila in Metoda Ljubljana: 46.0507536, 14.508083599999964, Saint Ulrich's Church Ljubljana";
    var locations3 = markers3.split(": ");
    for (var i = 0; i < locations3.length; i++) {
        var location3 = locations3[i].split(", ");
        var marker3 = new google.maps.Marker({
            position: {lat: parseFloat(location3[0]), lng: parseFloat(location3[1])},
            map: map,
            title: location3[2],
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
        });
        // console.log(location3);
    }
}

function lengthRatio() {
    var length = 0;
    var ratio = {};
    var tmp = Object.keys(analysisData);
    for (var i = 0; i < tmp.length; i++) {
        var flowKey = tmp[i];
        var flow = analysisData[flowKey];
        if (flow.PATH.length > 1) {
            if (ratio[flow.PATH.length + ""] === undefined) {
                ratio[flow.PATH.length + ""] = 1;
            } else {
                ratio[flow.PATH.length + ""] = ratio[flow.PATH.length + ""] + 1
            }
        }
    }
    console.log(JSON.stringify(ratio));
}

function drawGraph(pathData, num) {

    if (pathData.length > 1) {
        analysisData[generateKeyForPath(pathData)] = mainPaths[generateKeyForPath(pathData)];
    }

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
        modal.one('shown.bs.modal', function () {
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

    console.log("Analyzing: " + getCityName());

    showLoadingLayout();
    requestInfoData();
}

function requestInfoData() {
    setLoadingText("calculating center...");
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", infoRequestListener);
    var infoUrl = buildInfoUrl();
    console.log("infoRequest " + infoUrl);
    oReq.open("GET", "" +
        infoUrl);
    oReq.send();
}

function infoRequestListener() {
    var content = JSON.parse(this.responseText);
    centerLat = content["AVG_LAT"];
    centerLng = content["AVG_LNG"];
    MAX_REQUEST_PAGES = content["REQUEST_NUM"] - 1;
    dateProperties.maximumDate = content["MAX_DATE"];
    dateProperties.minimumDate = content["MIN_DATE"];
    var center = {lat: centerLat, lng: centerLng};
    map.setCenter(center);

    updateDateSelections();

    setLoadingText("fetching data...");
    if (firstLoad)
        requestInitData(0);
    else requestFilterData(0);
}

function requestInitData(page) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initRequestListener);
    var initRequestUrl = buildInitUrl(page);
    console.log("requestInitData: " + initRequestUrl);
    oReq.open("GET", initRequestUrl);
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
    document.getElementById("dropdownMenuTravelTypeContent").innerHTML = "";
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
    document.getElementById("dropdownMenuPlaceTypeContent").innerHTML = "";
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
    console.log("apply filters ---------- ");
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
    var requestUrl = buildFilterUrl(page);
    var oReq = new XMLHttpRequest();
    console.log("requestFilterData: " + requestUrl);
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
    placeDetails = {};
    polyLines = [];
    markers = {};
    relativityPathLength = {};
    relativityPathRepetition = {};
    requestCounter = 0;
    responseMain = "";
    histoRepetitions = {};
    histoRepetitions2 = [];
    analysisData = {};
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
    document.getElementById("datepicker-1").value = date1;
    document.getElementById("datepicker-2").value = date2;
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
