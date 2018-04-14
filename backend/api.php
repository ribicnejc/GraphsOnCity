<?php
require 'db.php';

//$databaseName = "tripviennaR";
$databaseName = "okpgR";
//$databaseName = "ljubljanaR";

$dateTo = "notSet";
$dateFrom = "notSet";
$pathSpan = "notSet";
$travelType = "notSet";
$placeType = "notSet";
$sqlClause1 = "notSet";
$sqlClause2 = "notSet";
$travelTypeClause = "notSet";
$requestPage = "notSet";


if (isset($_GET['city'])) {
    $databaseName = $_GET['city'];
}

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
$sql = "SELECT * FROM $databaseName";
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
//$sql = "SELECT * FROM $databaseName WHERE UID = '1FAAE70B61F2FC3EF3775CAC09317539'";
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
            $fixData["AGE"] = $age;
            $fixData["GENDER"] = $gender;
            $fixData["TRAVEL_STYLE"] = $travel_style;
            $fixData["USERNAME"] = $username;
            $paths = array();

            $path = array();
            $point = array();
            $point["LAT"] = $lat;
            $point["LNG"] = $lng;
            $point["REVIEW_ID"] = $rid;
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
            $point["REVIEW_ID"] = $rid;
            $point["PLACE_NAME"] = $place_name;
            $point["PLACE_DETAILS"] = $place_details;
            $point["PLACE_RATE"] = $place_rate;
            $point["REVIEW_RATE"] = $review_rate;
            $point["REVIEW_DATE"] = $review_date;

            //already created path are saved to $paths
            //this is OK
            $paths = $fixData["PATHS"];

            //if date of point compared to first date in path is more than 30 day it is considered new path
            //this is OK
            if (subtractDays($intDate, $lastDate) > $pathTimeSpan) {
                $paths[] = array();
                $lastDate = $intDate;
            }

            //whe save latest path to $pathtmp
            //this is OK
            $pathtmp = $paths[count($paths) - 1];

            //if latest path have at least one point, we save it as $lastpoint otherwise we set default value
            //this is OK
            $lastpoint = array();
            $lastpoint["PLACE_NAME"] = "notSetYet";
            if (count($pathtmp) != 0) {
                $lastpoint = $pathtmp[count($pathtmp) - 1];
            }

            //if last point and current point are not the same, we added point to path
            //this is OK
            if ($lastpoint["PLACE_NAME"] != $point["PLACE_NAME"]) {
                $paths[count($paths) - 1][] = $point;
            }

            //we update paths
            //this is OK
            $fixData["PATHS"] = $paths;
            $newData[$uid] = $fixData;
        }

    }
    echo json_encode($newData, JSON_UNESCAPED_UNICODE);
//    echo json_encode($data, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo $e->getMessage();
}

function subtractDays($date1, $date2) {
    $a = intval(strtotime($date2));
    $b = intval(strtotime($date1));
    $seconds = $b - $a;
    $minutes = $seconds / 60;
    $hours = $minutes / 60;
    $days = $hours / 24;
    return intval($days);
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