var map;


function reqListner() {
    var content = JSON.parse(this.responseText);
    console.log(this.code);
    findPaths(content);
}

function findPaths(data) {
    var prevUser = "";
    var paths = {};
    for (var i = 0; i < data.length; i++) {
        var userLine = data[i];
        if (userLine.username === prevUser) {
            var coordTuple = {};
            coordTuple.lat = userLine.lat;
            coordTuple.lng = userLine.lng;

            var tmpPath = paths.username;
            tmpPath.push(coordTuple);
            paths.username = tmpPath;
        }else {
            if (paths.username === undefined) {
                paths.username = [];
            }
        }
        prevUser = userLine.username;
    }
    //TODO paths.username is actually on attr, so I have to make HASHMap by username and then iterate over and draw graph!!!
    for (var username in paths) {
        if (paths.hasOwnProperty(username)) {
            drawGraph(paths.username);
        }
    }

}

function drawGraph(pathData) {
    var userPath = new google.maps.Polyline({
        path: pathData,
        geodesic: true,
        strokeColor: '#FFFF00',
        strokeOpacity: 10.5,
        strokeWeight: 5,
        map: map
    });
    // userPath.setMap(map);
}


var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListner);
oReq.open("GET", "" +
    "backend/main.php");
oReq.send();


function initMap() {
    // zoom: 13,
    // center: {lat: 46.0548178, lng: 14.5042642},
    map = new google.maps.Map(document.getElementById('map'), {
        // zoom: 3,
        // center: {lat: 0, lng: -180},
        zoom: 13,
        center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });

}

function getTestCoordinates() {
    var flightPlanCoordinates = [
        {lat: 37.772, lng: -122.214},
        {lat: 21.291, lng: -157.821},
        {lat: -18.142, lng: 178.431},
        {lat: -27.467, lng: 153.027}
    ];
    return flightPlanCoordinates;
}