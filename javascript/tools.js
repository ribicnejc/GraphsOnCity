//SLIDERS
var sliderNumOfPaths = document.getElementById("sliderNumberOfPaths");
var sliderNumOfPathsValue = document.getElementById("numberOfSamePathValue");

var sliderPathLength = document.getElementById("sliderNumOfPathLength");
var sliderPathLengthValue = document.getElementById("numberOfPathLength");

var sliderNumOfDay = document.getElementById("sliderNumOfDay");
var sliderNumOfDayValue = document.getElementById("numberOfDay");

sliderNumOfPaths.oninput = function () {
    sliderNumOfPathsValue.innerHTML = this.value;
};
sliderPathLength.oninput = function () {
    sliderPathLengthValue.innerHTML = this.value
};
sliderNumOfDay.oninput = function () {
    sliderNumOfDayValue.innerHTML = this.value;
};


//DATE PICKER
$(function() {
    $( "#datepicker-8" ).datepicker({
        prevText:"click for previous months",
        nextText:"click for next months",
        showOtherMonths:true,
        selectOtherMonths: false
    });
    $( "#datepicker-9" ).datepicker({
        prevText:"click for previous months",
        nextText:"click for next months",
        showOtherMonths:true,
        selectOtherMonths: true
    });
});

//DROP DOWN
$(function(){
    $(".dropdown-menu button").click(function(){
        console.log($(this).text());
        var div = document.getElementById("travelTypeElements");
        var button = document.createElement("button");
        button.className = "btn btn-secondary";
        var name = $(this).text();
        var text = document.createTextNode(name + "");
        button.appendChild(text);
        div.appendChild(button);
    });

});

//DROP DOWN TRAVEL STYLE DYNAMICALLY ADD BADGE
function fillTravelStyle(name) {
    var div = document.getElementById("travelTypeElements");
    var badge = document.createElement("span");
    //selected-travel-style class is there so I can retrieve selected elements in script.js
    badge.className = "badge badge-pill badge-default selected-travel-style";//"btn btn-secondary selected-travel-style";
    var text = document.createTextNode(name);
    badge.appendChild(text);
    div.appendChild(badge);
}

//DROP DOWN PLACE STYLE DYNAMICALLY ADD BADGE
function fillPlaceType(name) {
    var div = document.getElementById("placeTypeElements");
    var badge = document.createElement("span");
    //selected-place-style class is there so I can retrieve selected elements in script.js
    badge.className = "badge badge-pill badge-default selected-place-style";
    var text = document.createTextNode(name);
    badge.appendChild(text);
    div.appendChild(badge);
}

//RESET SETTINGS
function resetSettings(){
    var sliderNum1 = document.getElementById("numberOfSamePathValue");
    var sliderNum2 = document.getElementById("numberOfPathLength");
    var sliderNum3 = document.getElementById("numberOfDay");
    sliderNum1.innerHTML = "50";
    sliderNum2.innerHTML = "50";
    sliderNum3.innerHTML = "50";

    var slider1 = document.getElementById("sliderNumberOfPaths");
    var slider2 = document.getElementById("sliderNumOfPathLength");
    var slider3 = document.getElementById("sliderNumOfDay");
    slider1.value = "50";
    slider2.value = "50";
    slider3.value = "50";

    var datePicker1 = document.getElementById("datepicker-8");
    var datePicker2 = document.getElementById("datepicker-9");
    datePicker1.value = "";
    datePicker2.value = "";

    var dropDown = document.getElementById("travelTypeElements");
    dropDown.innerHTML = "";
}


function histo(travelStyleData) {

    var histoDataArray = [];
    histoDataArray.push(["Type", "Number"]);
    for (var style in travelStyleData) {
        if (travelStyleData.hasOwnProperty(style)) {
            var tmpArray = [];
            tmpArray.push(style);
            tmpArray.push(travelStyleData[style]);
            histoDataArray.push(tmpArray);
        }
    }

    google.charts.load('current', {packages: ['corechart']});

    function drawChart() {
        // Define the chart to be drawn.
        // var data = google.visualization.arrayToDataTable([
        //     ['Type', 'Number'],
        //     ['Foodie', 900],
        //     ['Like a local', 1000],
        //     ['NihtTimeSeeker', 1170],
        //     ['Pussy banger', 1250],
        //     ['Kebab Eater', 530]
        // ]);
        var data = google.visualization.arrayToDataTable(histoDataArray);
        var options = {title: 'Statistic of travel type'};

        // Instantiate and draw the chart.
        var chart = new google.visualization.ColumnChart(document.getElementById('container'));
        chart.draw(data, options);
    }
    google.charts.setOnLoadCallback(drawChart);
}


function generateKeyForPath(pathData) {
    var key = "";
    for (var i = 0; i < pathData.length; i++) {
        var latnlng = pathData[i];
        key = key + latnlng.lat + "" + latnlng.lng;
    }
    return key;
}


function getTravelTypeSelectedArray() {
    var travelStyleForUser = [];
    var travelTypeElements = document.getElementsByClassName("selected-travel-style");
    for (var btnI = 0; btnI < travelTypeElements.length; btnI++) {
        var travelText = travelTypeElements[btnI].innerHTML;
        travelStyleForUser.push(travelText);
    }
    return travelStyleForUser;
}

function getPlaceTypeSelectedArray() {
    var placeTypeSelected = [];
    var placeTypeElements = document.getElementsByClassName("selected-place-style");
    for (var btnJ = 0; btnJ < placeTypeElements.length; btnJ++) {
        var placeTypeText = placeTypeElements[btnJ].innerHTML;
        placeTypeSelected.push(placeTypeText);
    }
    return placeTypeSelected;
}

var checkbox = document.getElementById("showMarkers");

checkbox.addEventListener( 'change', function() {
    if(this.checked) {
        console.log("Showing markers");
        showMarkers()
    } else {
        console.log("Hiding markers");
        clearMarkers();
    }
});