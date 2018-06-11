//Scrap on website: https://gps-coordinates.org/
//Spoof this script inside of console



var addresses = "Triple Bridge (Tromostovje) Ljubljana&&Tivoli Park Ljubljana&&Franciscan Church (Franciskanska cerkev) Ljubljana&&Preseren Square Ljubljana&&River Ljubljanica Kanal Ljubljana&&Ljubljana Old Town Ljubljana&&Metelkova Ljubljana&&Cathedral of St. Nicholas (Stolnica Sv. Nikolaja) Ljubljana&&Dragon Bridge (Zmajski Most) Ljubljana&&Vodnik Square (Vodnikov trg) Ljubljana&&Cankarjevo nabrezje Ljubljana&&Ljubljana Castle Funicular Ljubljana&&Congress Square (Kongresni trg) Ljubljana&&Mestni Trg Ljubljana&&Sts. Cyril and Methodius Church Ljubljana&&Old Square (Stari trg) Ljubljana&&Museum of Illusions Ljubljana&&National Museum of Contemporary History (Muzej Novejse Zgodovine Slovenije) Ljubljana&&Skyscraper (Neboticnik) Ljubljana&&Tourist Information Centre Ljubljana Ljubljana&&Central Market Ljubljana&&ZOO Ljubljana Ljubljana&&Gornji Trg Ljubljana&&Union Experience Ljubljana&&Butcher's Bridge Ljubljana&&Ljubljana Castle Ljubljana&&National Museum of Slovenia Ljubljana&&Fountain of Three Carniolan Rivers (Vodnjak treh kranjskih rek) Ljubljana&&Hauptmannova Hisa Ljubljana&&Shoemaker's Bridge (Cevljarski Most) Ljubljana&&Plecnik House Ljubljana&&National and University Library Ljubljana&&Slovenian Philharmonic Hall (Slovenska Filharmonija) Ljubljana&&Opera Ljubljana&&Zale Cemetery Ljubljana&&House of Experiments - Hisa eksperimentov Ljubljana&&Town Hall (Magistrat) Ljubljana&&Cooperative Business Bank Ljubljana&&Railway Museum Ljubljana&&Slovene Ethnographic Museum Ljubljana&&National Gallery (Narodna Galerija) Ljubljana&&Minicity Ljubljana Ljubljana&&Technical Museum of Slovenia Ljubljana&&City Museum of Ljubljana Ljubljana&&Ursuline Church of the Holy Trinity Ljubljana&&Odprta kuhna Ljubljana&&Modern Gallery (Moderna Galerija) Ljubljana&&Church of St. James Ljubljana&&University Botanic Gardens Ljubljana Ljubljana&&Monastery of the Holy Cross Summer Theater (Krizanke Poletno Gledalisce) Ljubljana&&Cankarjev dom (Cultural and Congress Centre) Ljubljana&&Cyril Methodius Square (Ciril-Metodov trg) Ljubljana&&French Revolution Square (Trg Francoske Revolucije) Ljubljana&&Planetarij Ljubljana Ljubljana&&Breg embankment Ljubljana&&CityPark Shopping Center Ljubljana&&Museum of Puppetry Ljubljana&&Snopc o' tecca Ljubljana&&Krizevniska ulica Ljubljana&&Seminary Palace and Library Ljubljana&&Public Loan Bank Building Ljubljana&&Church of St. Michael Ljubljana&&Galerija Fotografija Ljubljana&&City Savings Bank Building Ljubljana&&Roman Wall Ljubljana&&Museum of Contemporary Art Metelkova (MSUM) Ljubljana&&Stozice Stadium Ljubljana&&Hercules Fountain Ljubljana&&St. Francis Church Ljubljana&&Schweigerjeva House Ljubljana&&Avtobusna postaja Ljubljana Ljubljana&&Krizanke Church Ljubljana&&Universita di Lubiana Ljubljana&&Romarska c. Matere Bozje Ljubljana&&Miklosiceva Street Ljubljana&&Hradecky Bridge Ljubljana&&Ljubljana Central Pharmacy Building Ljubljana&&Path of Remembrance and Comradeship Ljubljana&&Trnovo Bridge Ljubljana&&Galerija Hest Ljubljana&&Tiporenesansa Ljubljana&&Ljubljana Exhibition and Convention Centre Ljubljana&&Sticna Mansion Ljubljana&&Retro swimming pool Ilirija Ljubljana&&Ravnikar Gallery Space Ljubljana&&Trnovo Church Ljubljana&&Park Spica Ljubljana&&Emonan House Ljubljana&&Ljubljanica River Barrier Ljubljana&&The Land of Ice Ljubljana&&DobraVaga Gallery Ljubljana&&Republic Square (Trg Republike) Ljubljana&&Museum of Architecture and Design (MAO) Ljubljana&&Fish Square (Ribji trg) Ljubljana&&Church of the Sacred Heart of Jesus Ljubljana&&St. Peter's Parish Church Ljubljana&&St Florian's Church Ljubljana&&Citizen of Emona Statue Ljubljana&&LPP Buses Ljubljana&&France Preseren statue Ljubljana";
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