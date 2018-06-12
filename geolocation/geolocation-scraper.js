//Scrap on website: https://gps-coordinates.org/
//Spoof this script inside of console


var addresses = "State Opera House Vienna&&St. Peter's Church Vienna&&Imperial Treasury of Vienna Vienna&&MuseumsQuartier Wien Vienna&&Leopold Museum Vienna&&Kahlenberg Vienna&&Volksgarten Vienna&&Rathaus Vienna&&Tiergarten Schoenbrunn - Zoo Vienna Vienna&&The Vienna Philharmonic Vienna&&Central Cemetery (Zentralfriedhof) Vienna&&Schonbrunner Gardens Vienna&&Albertina Vienna&&Natural History Museum (Naturhistorisches Museum) Vienna&&Rathausplatz Vienna&&Church of the Jesuits Vienna&&State Hall of the Austrian National Library Vienna&&Vienna U-Bahn Vienna&&Kirche am Steinhof Vienna&&The Third Man Museum Vienna&&Kunsthistorisches Museum Vienna&&St. Stephen's Cathedral Vienna&&Belvedere Palace Museum Vienna&&Imperial Palace (Hofburg) Vienna&&Schonbrunn Palace Vienna&&Historic Center of Vienna Vienna&&Ringstrasse Vienna&&Karlskirche Vienna&&Christmas Market on Rathausplatz Vienna&&Parliament Building Vienna&&Imperial Carriage Museum Vienna Vienna&&Graben and Kohlmarkt Vienna&&Stephansplatz Vienna&&Museum of Military History Vienna&&Maria-Theresien-Platz Vienna&&Technisches Museum Vienna&&Musikverein Vienna&&Minoritenkirche Vienna&&Kunst Haus Wien - Museum Hundertwasser Vienna&&Kapuziner Crypt (Kapuzinergruft) Vienna&&MAK - Austrian Museum of Applied Arts / Contemporary Art Vienna&&St. Anna's Church Vienna&&Neue Burg Vienna&&Vienna Woods Vienna&&Haus des Meeres - Aqua Terra Zoo Vienna&&Vienna Pass Vienna&&Spittelberg Christmas Market Vienna&&Volksoper Vienna&&Michaelerplatz Vienna&&Gloriette Vienna&&Universitat Wien Vienna&&Lainzer Tiergarten Vienna&&Schoenbrunn Palace Christmas Market Vienna&&Donaupark Vienna&&Dominican Church Vienna&&Votivkirche Vienna&&Prater Vienna&&Kaerntnerstrasse Vienna&&Maria Theresia Denkmal Vienna&&Hundertwasserhaus Vienna&&Stadtpark Vienna&&Danube Tower Vienna&&Haus der Musik Vienna&&Burggarten Vienna&&Judenplatz Holocaust Memorial Vienna&&Sisi Museum Vienna&&Augustinerkirche Vienna&&Plague Column (Pestsaule) Vienna&&Mariahilfer Strasse Vienna&&Karlsplatz Vienna&&City Airport Train Vienna&&Wien Hauptbahnhof Sud Vienna&&Academy of Fine Arts (Akademie der bildenden Kunste) Vienna&&Kaiserappartements Vienna&&Burgtheater Vienna&&Strauss Monument Vienna&&Hofmobiliendepot (Imperial Furniture Collection) Vienna&&Botanischer Garten (Botanical Garden of the University of Vienna) Vienna&&St. Michael's Church Vienna&&The Strudelshow Vienna&&Griechenkirche zur heiligen Dreifaltigkeit Vienna&&Soviet War Memorial Vienna&&Museum of Illusions Vienna&&Heldenplatz Vienna&&Spittelberg Quarter Vienna&&Jewish Museum Vienna (Judisches Museum der Stadt Wien) Vienna&&Vienna Naschmarkt Vienna&&Praterstern Vienna&&Wiener Konzerthaus Vienna&&Anker Clock Vienna&&Dorotheum Vienna&&Riesenrad Vienna&&Trinitarierkirche zum Heiligen Franz von Assisi Vienna&&Vienna Coffeehouse Conversations Vienna&&Vienna Museum Vienna&&Meinl am Graben Vienna&&Russian Orthodox Cathedral of St. Nicholas Vienna&&Palmenhaus Schoenbrunn Vienna&&Ernst Happel Stadion Vienna&&Madame Tussauds Vienna Vienna";
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