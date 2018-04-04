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