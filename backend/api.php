<?php
require 'db.php';

$dateTo = "notSet";
$dateFrom = "notSet";
$pathSpan = "notSet";
$travelType = "notSet";
$placeType = "notSet";
$sqlClause1 = "notSet";
$sqlClause2 = "notSet";
$travelTypeClause = "notSet";
$requestPage = "notSet";


if (isset($_GET['dateTo'])) {
    $dateTo = intval($_GET['dateTo']);
    $sqlClause1 = "REVIEW_DATE < $dateTo";
}
if (isset($_GET['dateFrom'])) {
    $dateFrom = intval($_GET['dateFrom']);
    $sqlClause2 = "REVIEW_DATE > $dateFrom";
}

if (isset($_GET['pathSpan'])) {
    $pathSpan = intval($_GET['pathSpan']);
}

if (isset($_GET['page'])) {
    $requestPage = intval($_GET['page']);
}

if (isset($_GET['travelType'])) {
    $travelTypeArray = explode(",", $_GET['travelType']);
    $travelTypeClause = "";
    $i = 0;
    foreach ($travelTypeArray as $type){
        if($i == 0)
            $travelTypeClause = "TRAVEL_STYLE LIKE '%$type%'";
        else
            $travelTypeClause = "$travelTypeClause AND TRAVEL_STYLE LIKE '%$type%'";
        $i++;
    }
}

$sqlClause = "notSet";
if ($sqlClause1 != "notSet" && $sqlClause2 != "notSet") {
    $sqlClause = "$sqlClause1 AND $sqlClause2";
} else if ($sqlClause1 != "notSet") {
    $sqlClause = "$sqlClause1";
} else if ($sqlClause2 != "notSet") {
    $sqlClause = "$sqlClause2";
}
$sql = "SELECT * FROM tripviennar";
if ($sqlClause != "notSet") {
    $sql = "$sql WHERE $sqlClause";
}
if ($travelTypeClause != "notSet") {
    if (strpos($sql, "WHERE") !== false) {
        $sql = "$sql AND $travelTypeClause";
    }else {
        $sql = "$sql WHERE $travelTypeClause";
    }
}
$sql = "$sql ORDER BY UID, REVIEW_ID ASC";

if ($requestPage."" != "notSet") {
    $sql = "$sql LIMIT 36000 OFFSET " . $requestPage * 36000;
}
//echo $sql;
//return 0;
try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    $a = 0;
    $users = array();

    if ($pathSpan == "notSet")
        $pathTimeSpan = 50000000; //Means a century of days
    else $pathTimeSpan = $pathSpan;

    $lastDate = 0;
    $newData = array();
    foreach ($data as $userObject) {
        $uid = $userObject->UID;
        $rid = $userObject->REVIEW_ID;
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
            $fixData["REVIEW_ID"] = $rid;
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