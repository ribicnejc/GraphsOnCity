function runAndDrawRelativeData(mainPathsLocal) {
    var relativeRepetition = [];
    var relativeLength = [];

    for(var i in relativityPathRepetition) {
        if(relativityPathRepetition.hasOwnProperty(i)) {
            relativeRepetition.push(parseInt(i));
        }
    }

    for(var j in relativityPathLength) {
        if (relativityPathLength.hasOwnProperty(j)) {
            relativeLength.push(parseInt(j))
        }
    }

    relativeRepetition = sortNumbersAsc(relativeRepetition);
    relativeLength = sortNumbersAsc(relativeLength);

    var relativeRepetitionValue1 = $('#slider-path-repetition').slider("values", 0);
    var relativeRepetitionValue2 = $('#slider-path-repetition').slider("values", 1);

    var relativeLengthValue1 = $('#slider-path-length').slider("values", 0);
    var relativeLengthValue2 = $('#slider-path-length').slider("values", 1);

    var repetition = [0, 0];
    var length = [0, 0];

    repetition[0] = Math.floor((relativeRepetition.length * relativeRepetitionValue1) / 100);
    repetition[1] = Math.floor((relativeRepetition.length * relativeRepetitionValue2) / 100);

    if (repetition[1] === relativeRepetition.length) {
        repetition[1] = repetition[1] - 1;
    }
    if (repetition[0] === relativeRepetition.length) {
        repetition[0] = repetition[0] - 1;
    }
    repetition[0] = relativeRepetition[repetition[0]];
    repetition[1] = relativeRepetition[repetition[1]];


    length[0] = Math.floor((relativeLength.length * relativeLengthValue1) / 100);
    length[1] = Math.floor((relativeLength.length * relativeLengthValue2) / 100);
    if (length[1] === relativeLength.length) {
        length[1] = length[1] - 1;
    }
    if (length[0] === relativeLength.length) {
        length[0] = length[0] - 1;
    }
    length[0] = relativeLength[length[0]];
    length[1] = relativeLength[length[1]];



    for (var pathKEY in mainPathsLocal) {
        if (mainPathsLocal.hasOwnProperty(pathKEY)) {
            var pathToDrawOn = mainPathsLocal[pathKEY];
            var path = pathToDrawOn["PATH"];
            var numOfSamePaths = pathToDrawOn["SAME_PATH_NUM"];
            var pathLength = path.length;

            if (numOfSamePaths >= repetition[0] && numOfSamePaths <= repetition[1]) {
                if (pathLength >= length[0] && pathLength <= length[1]) {
                    drawGraph(path, numOfSamePaths);
                }
            }
        }
    }
}


function countRelativeLocalPlaces(relativeLocalPlaces) {
    var count = 0;
    for (var relativePlaceKey in relativeLocalPlaces) {
        if (relativeLocalPlaces.hasOwnProperty(relativePlaceKey)) {
            if (relativeLocalPlaces[relativePlaceKey] === true) count++;
        }
    }
    return count;
}