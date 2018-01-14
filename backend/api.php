<?php
require 'db.php';

$dateTo = "notSet";
$dateFrom = "notSet";
$pathSpan = "notSet";
$sqlClause1 = "notSet";
$sqlClause2 = "notSet";
if (isset($_GET['dateTo'])) {
    $dateTo = intval($_GET['dateTo']);
    $sqlClause1 = "REVIEW_DATE > $dateTo";
}
if (isset($_GET['dateFrom'])) {
    $dateFrom = intval($_GET['dateFrom']);
    $sqlClause2 = "REVIEW_DATE < $dateFrom";
}

if (isset($_GET['pathSpan'])) {
    $pathSpan = intval($_GET['pathSpan']);
}

$sqlClause = "notSet";
if ($sqlClause1 != "notSet" && $sqlClause2 != "notSet") {
    $sqlClause = "$sqlClause1 AND $sqlClause2";
} else if ($sqlClause1 != "notSet") {
    $sqlClause = "$sqlClause1";
} else if ($sqlClause2 != "notSet") {
    $sqlClause = "$sqlClause2";
}

if ($sqlClause == "notSet")
    $sql = "SELECT * FROM trip ORDER BY UID, REVIEW_DATE ASC";
else {
    $sql = "SELECT * FROM trip WHERE $sqlClause ORDER BY UID, REVIEW_DATE ASC";
}
try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    $a = 0;
    $users = array();

    $pathTimeSpan = 50000000; //Means five days

    $lastDate = 0;
    $newData = array();
    foreach ($data as $userObject) {
        $uid = $userObject->UID;
        $age = $userObject->AGE;
        $gender = $userObject->GENDER;
        $travel_style = $userObject->TRAVEL_STYLE;
        $username = $userObject->USERNAME;
        $lat = $userObject->LAT;
        $lng = $userObject->LNG;
        $place_details = $userObject->PLACE_DETAILS;
        $place_name = $userObject->PLACE_NAME;
        $review_date = $userObject->REVIEW_DATE;
        $review_rate = $userObject->REVIEW_RATE;
        $place_rate = $userObject->PLACE_RATE;

        if (!array_key_exists($uid, $newData)) {
            $fixData = array();
            $fixData["UID"] = $uid;
            $fixData["AGE"] = $age;
            $fixData["GENDER"] = $gender;
            $fixData["TRAVEL_STYLE"] = $travel_style;
            $fixData["USERNAME"] = $username;
            $paths = array();

            $path = array();
            $point = array();
            $point["LAT"] = $lat;
            $point["LNG"] = $lng;
            $point["PLACE_NAME"] = $place_name;
            $point["PLACE_DETAILS"] = $place_details;
            $point["PLACE_RATE"] = $place_rate;
            $point["REVIEW_RATE"] = $review_rate;
            $point["REVIEW_DATE"] = $review_date;

            $lastDate = intval($review_date);

            $path[] = $point;
            $paths[] = $path;
            $fixData["PATHS"] = $paths;
            $newData[$uid] = $fixData;
        } else {
            $fixData = $newData[$uid];
            $intDate = intval($review_date);

            $point = array();
            $point["LAT"] = $lat;
            $point["LNG"] = $lng;
            $point["PLACE_NAME"] = $place_name;
            $point["PLACE_DETAILS"] = $place_details;
            $point["PLACE_RATE"] = $place_rate;
            $point["REVIEW_RATE"] = $review_rate;
            $point["REVIEW_DATE"] = $review_date;

            $paths = $fixData["PATHS"];
            if ($intDate - $lastDate > $pathTimeSpan) {
                $paths[] = array();
                $lastDate = $intDate;
            }
            $paths[count($paths) - 1][] = $point;
            $fixData["PATHS"] = $paths;
            $newData[$uid] = $fixData;
        }

    }
    echo json_encode($newData, JSON_UNESCAPED_UNICODE);
//    echo json_encode($data, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo $e->getMessage();
}

/**
 * "uiddsdfsfsfsf": {
 * UID: "dd",
 * AGE: "dd",
 * GENDER: "dd",
 * TRAVEL_STYLE: "DD",
 * PATHS:
 * [
 * [
 * {
 * lat: 123,
 * lng: 124,
 * place_name: "lj",
 * place_details: "tmp",
 * review_date: 1234
 * },
 * {
 * lat: 123,
 * lng: 122,
 * place_name: "kr",
 * place_details: "tmp",
 * review_date: 1234
 * }
 * ],
 * [
 * {
 * lat: 123,
 * lng: 124,
 * place_name: "lj",
 * place_details: "tmp",
 * review_date: 1234
 * },
 * {
 * lat: 123,
 * lng: 122,
 * place_name: "kr",
 * place_details: "tmp",
 * review_date: 1234
 * }
 * ]
 * ]
 * }
 *
 */