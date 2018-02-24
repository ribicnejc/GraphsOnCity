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

/**
 * function initialize jQueryUI slider and create listener for changes of value, so user can see on top of
 * sliders value instantly
 * @param id of slider
 * @param valueID is a label which is updated with value when slider change position
 */
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
    initOneHandleSlider("slider-path-repetition", "slider-path-repetition-amount");
    initOneHandleSlider("slider-path-length", "slider-path-length-amount");
});

var checkboxRelativity = document.getElementById("relativeCheckbox");
checkboxRelativity.addEventListener('change', function () {
    if (this.checked) {
        makeDoubleHandleSlider("slider-path-repetition", "slider-path-repetition-amount");
        makeDoubleHandleSlider("slider-path-length", "slider-path-length-amount");
    } else {
        makeOneHandleSlider("slider-path-repetition", "slider-path-repetition-amount");
        makeOneHandleSlider("slider-path-length", "slider-path-length-amount");
    }
});