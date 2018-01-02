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

        addMarker(coordTuple);

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

function addMarker(coords) {
    var marker = new google.maps.Marker({
        position: coords,
        title: 'Hello World!'
    });

    // var markers = [];
    // window.setTimeout(function() {
    //     markers.push(new google.maps.Marker({
    //         position: coords,
    //         map: map,
    //         animation: google.maps.Animation.DROP
    //     }));
    // }, 100);

    marker.setMap(map);
}

function drawGraph(pathData) {
    this.userPath = new google.maps.Polyline({
        path: pathData,
        geodesic: true,
        strokeColor: "#0000FF",//randomColor(),
        strokeOpacity: 1.0,
        strokeWeight: 5
    });

    google.maps.event.addListener(this.userPath, 'mouseover', function() {
        this.setOptions({
            strokeOpacity : 0.5
        });
    });
    google.maps.event.addListener(this.userPath, 'click', function() {
        alert("Test click");
    });
    google.maps.event.addListener(this.userPath, 'mouseout', function() {
        this.setOptions({
            strokeOpacity : 1
        });
    });

    // map.addListener(this.userPath, 'click', function(){
    //     console.log("test");
    // });
    this.userPath.setMap(map);
}

function testClick(){
    console.log("test");
}



function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 46.0548178, lng: 14.5042642},
        mapTypeId: 'terrain'
    });
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListner);
    oReq.open("GET", "" +
        "backend/main.php?api=nejc&key=Code");
    oReq.send();
}

function randomColor() {
    var parts = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += parts[Math.floor(Math.random() * 15)];
    }
    return color;
}