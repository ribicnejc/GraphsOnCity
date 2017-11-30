function reqListner () {
    console.log(this.responseText);
}

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", reqListner);
oReq.open("GET", "" +
    "backend/main.php");
oReq.send();



function initMap() {
    // zoom: 13,
    // center: {lat: 46.0548178, lng: 14.5042642},


    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: {lat: 0, lng: -180},
        mapTypeId: 'terrain'
    });

    var flightPath = new google.maps.Polyline({
        path: getCoordinatePoints(),
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 10.5,
        strokeWeight: 5
    });

    flightPath.setMap(map);}

function getCoordinatePoints() {
    var flightPlanCoordinates = [
        {lat: 37.772, lng: -122.214},
        {lat: 21.291, lng: -157.821},
        {lat: -18.142, lng: 178.431},
        {lat: -27.467, lng: 153.027}
    ];
    return flightPlanCoordinates;
}