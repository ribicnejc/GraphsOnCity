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

//DROP DOWN DYNAMICAL
function fillTravelStyle(name) {
    var div = document.getElementById("travelTypeElements");
    var button = document.createElement("button");
    button.className = "btn btn-secondary";
    var text = document.createTextNode(name);
    button.appendChild(text);
    div.appendChild(button);
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