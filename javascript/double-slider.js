function makeOneHandleSlider(id, valueID) {
    var currentValueLeftHandle2 = parseInt($("#"+id).slider("values", 0));
    $("#"+id).slider("option", "range", false);
    $("#"+id).slider("option", "values", [currentValueLeftHandle2]);
    $("#"+id).slider("option", "slide", function (event, ui) {
        $("#" + valueID).val("%" + ui.values[0]);
    });
    document.getElementById(id).childNodes[1].remove();
    $("#" + valueID).val("%" + $("#"+id).slider("values", 0));
}

function makeDoubleHandleSlider(id, valueID) {
    var currentValueLeftHandle = parseInt($("#"+id).slider("values", 0));
    $("#"+id).slider("option", "range", true);
    $("#"+id).slider("option", "values", [currentValueLeftHandle, 100]);
    $("#"+id).slider("option", "slide", function (event, ui) {
        $("#" + valueID).val("%" + ui.values[0] + " - %" + ui.values[1]);
    });
    $("#" + valueID).val("%" + $("#"+id).slider("values", 0) +
        " - %" + $("#"+id).slider("values", 1));
}

function initOneHandleSlider(id, valueID) {
    $("#"+id).slider({
        range: false,
        min: 0,
        max: 100,
        animate: "slow",
        values: [20],
        slide: function (event, ui) {
            $("#" + valueID).val("%" + ui.values[0]);
        }
    });
    $("#" + valueID).val("%" + $("#"+id).slider("values", 0));
}

//Double slider jQueryUI initialization of double slider
$(function () {
    initOneHandleSlider("slider-range", "amount");
    initOneHandleSlider("slider-range2", "amount2");
    initOneHandleSlider("slider-range3", "amount3");
});

var checkboxRelativity = document.getElementById("relativeCheckbox");
checkboxRelativity.addEventListener('change', function () {
    if (this.checked) {
        makeDoubleHandleSlider("slider-range", "amount");
        makeDoubleHandleSlider("slider-range2", "amount2");
        makeDoubleHandleSlider("slider-range3", "amount3");
    } else {
        makeOneHandleSlider("slider-range", "amount");
        makeOneHandleSlider("slider-range2", "amount2");
        makeOneHandleSlider("slider-range3", "amount3");
    }
});