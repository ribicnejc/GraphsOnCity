//TODO here add all google maps functions

// function addMarker(coords, placeName) {
//     var marker = new google.maps.Marker({
//         position: coords,
//         title: placeName
//     });
//     marker.addListener('click', function () {
//         alert(placeName);
//     });
//
//     marker.setMap(map);
//     markers.push(marker);
//
// }


function getDialogMapMarkerLabel(i, length) {
    if (i === length - 1) return "E";
    if (i === 0) return "S";
    return "" + i;
}

function getPathStroke(pathReps) {
    var stroke = document.getElementById("pathStroke").innerText;
    var strokeMax = parseInt($('#sliderPathStroke')[0].max) / 10.0;

    //cursor lower percent, so it is lowered effect of stroke width
    // 5 * x = 0.2
    var x = 0.2 / strokeMax;
    var percent = parseFloat(stroke) * x;
    var calc = pathReps * percent;

    if (calc < 2) return 2.0;
    return calc;
}