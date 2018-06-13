//Scrap on website: https://gps-coordinates.org/
//Spoof this script inside of console

var addresses = "Skulptur Der letzte Mensch Vienna&&AIBC Field Freudenau Vienna&&Tilgner Brunnen Vienna&&Resselpark Vienna&&Firma Ingeneur Wolfgang Irzl Vienna&&Columbus Center Vienna&&Denkmal Rudolf von Alt Vienna&&Denkmal Friedrich von Amerling Vienna&&Denkmal Erzherzog Albrecht Vienna&&Denkmal Marcus Omufuma Vienna&&Denkmal Siegfried Marcus Vienna&&Denkmal Kaiser Josef II. Vienna&&Denkmal Robert Stolz Vienna&&Denkmal Kaiser Franz Josef I. von Osterreich Vienna&&Wiener Trabrennverein Vienna&&Denkmal Emil Jakob Schindler Vienna&&Karl Lueger Monument Vienna&&Memorial for the Victims of Nazi Military Justice Vienna&&Deutschmeister-Denkmal Vienna&&Denkmal Josef Madersperger Vienna&&Stiftskirche Vienna&&Donauweibchenbrunnen Vienna&&Denkmal Kaiser Franz I. Stephan von Lothringen Vienna&&Denkmal Abraham a Santa Clara Vienna&&Labetrunkbrunnen Vienna&&Sebastian Kneipp Brunnen Vienna&&Osterreichische Gesellschaft fur Literatur Vienna&&Fussball Museum Vienna&&Vienna Crime Museum Vienna&&The Austrian Architecture Museum (Architekturzentrum Wien) Vienna&&Villa Wertheimstein Vienna&&Italienisches Kulturinstitut - Wien Vienna&&Dom Museum Wien Vienna&&Hemp Embassy Vienna Vienna&&Waringer Park Vienna&&Sankt Johann Nepomuk Vienna&&Produzentengalerie Wien Vienna&&Museum of Young Art (MOYA) Vienna&&The Vienna Workshop Gallery Vienna&&The Islamic Cultural Center of Bad Voslau Vienna&&Schubert's death house in Vienna Vienna&&Pfarre Breitensee Vienna&&Wiener Galopprennverein Vienna&&Kabarett Simpl Vienna&&Rudolf Moratti Sculpture Vienna&&Adolf Scharf Monument Vienna&&Austria Memphis Vienna&&Karl Seitz Statue Vienna&&Kaiser Franz II Monument Vienna&&Rearte Gallery Vienna&&Peter Kulcsar Antiquitatenhandel Wien Vienna&&Ernst Mach Monument Vienna&&Rahlstiege Vienna";
addresses = addresses.split("&&");
var addressPosition = 0;
var coordsOfAddresses = [];
function fetch(address)
{	geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        var geolocate = new google.maps.LatLng(latitude, longitude);
        coordsOfAddresses.push({"address": address, "lat": latitude, "lng": longitude});
        console.log("Successful geolocated: " + address + " with lat: " + latitude + ", lng: " + longitude)
    }
});
}

function toCSV() {
    var coords = "address, lat, lng"+ "\n";
    for (var i = 0; i < coordsOfAddresses.length; i++) {
        coords += coordsOfAddresses[i].address + ", " + coordsOfAddresses[i].lat + ", " + coordsOfAddresses[i].lng + "\n";
    }
    console.log(coords);
}

var intervalId = window.setInterval(function(){
    if (coordsOfAddresses.length === addresses.length) {
        window.clearInterval(intervalId);
        toCSV();
    }
    console.log("fetching " + addresses[addressPosition]);
    fetch(addresses[addressPosition++]);
}, 1500);