var map;

function reqListner() {
    var content = JSON.parse(this.responseText);
    findPaths(content);
}

function findPaths(data) {
    var paths = {};
    for (var i = 0; i < data.length; i++) {
        var userLine = data[i];
        var usernme = userLine.username;
        var coordTuple = {};
        coordTuple.lat = userLine.lat;
        coordTuple.lng = userLine.lng;

        if (paths[usernme] === undefined) paths[usernme] = [];

        var tmp = paths[usernme];
        tmp.push(coordTuple);
        paths[usernme] = tmp;
    }

    for (var username in paths) {
        if (paths.hasOwnProperty(username)) {
            if (paths[username] === undefined) continue;
            drawGraph(paths[username]);
        }
    }
}

function drawGraph(pathData) {
    var userPath = new google.maps.Polyline({
        path: pathData,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 1
    });
    userPath.setMap(map);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListner);
oReq.open("GET", "" +
    "backend/main.php");
oReq.send();

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });

}