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
        var div = document.getElementById("travelTypeElements");
        var button = document.createElement("button");
        button.className = "btn btn-secondary";
        var name = $(this).text();
        var text = document.createTextNode(name + "");
        button.appendChild(text);
        div.appendChild(button);
    });

});