function pathColor(reps) {
    if (quickStat[reps] === undefined) {
        quickStat[reps] = 1;
    } else {
        quickStat[reps] = quickStat[reps] + 1;
    }
    if (reps < 2) {
        return "#000000";
    } else if (reps < 3) {
        return "#100000";
    } else if (reps < 4) {
        return "#200000";
    } else if (reps < 5) {
        return "#300000";
    } else if (reps < 6) {
        return "#400000";
    } else if (reps < 7) {
        return "#500000";
    } else if (reps < 8) {
        return "#600000";
    } else if (reps < 9) {
        return "#700000";
    } else if (reps < 10) {
        return "#900000";
    } else if (reps < 11) {
        return "#a00000";
    } else if (reps < 12) {
        return "#b00000";
    } else if (reps < 13) {
        return "#c00000";
    } else if (reps < 14) {
        return "#e00000";
    } else
        return "#f00000";
}

function randomColor() {
    var parts = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += parts[Math.floor(Math.random() * 15)];
    }
    return color;
}

function colorLine(amount) {
    if (quickStat[amount] === undefined) {
        quickStat[amount] = 1;
    } else {
        quickStat[amount] = quickStat[amount] + 1;
    }
    if (amount < 3) {
        return "#000";
    } else if (amount < 7) {
        return "#400";
    } else if (amount < 10) {
        return "#800";
    } else if (amount < 15) {
        return "#a00";
    } else
        return "#f00";
}