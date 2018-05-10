<?php
require '../db.php';

//CITY NAME
$cityName = "Ljubljana";

//DATABASE TABLE DEFINITION
$tableLocation = $cityName . "Location";
$tablePost = $cityName . "Post";
$tableTourist = $cityName . "Tourist";

//QUERY PARAMETERS
$dateTo = "notSet";
$dateFrom = "notSet";
$pathSpan = "notSet";
$travelType = "notSet";
$travelTypeClause = "notSet";
$sqlClause1 = "notSet";
$sqlClause2 = "notSet";
$placeType = "notSet";
$page = "notSet";

//QUERY PARSER
if (isset($_GET['city'])) {
    $cityName = $_GET['city'];
}
if (isset($_GET['dateTo'])) {
    $dateTo = intval($_GET['dateTo']);
    $sqlClause1 = "$tablePost.REVIEW_DATE < $dateTo";
}
if (isset($_GET['dateFrom'])) {
    $dateFrom = intval($_GET['dateFrom']);
    $sqlClause2 = "$tablePost.REVIEW_DATE > $dateFrom";
}
if (isset($_GET['pathSpan'])) {
    $pathSpan = intval($_GET['pathSpan']);
}
if (isset($_GET['page'])) {
    $page = intval($_GET['page']);
}
if (isset($_GET['travelType'])) {
    $travelTypeArray = explode(",", $_GET['travelType']);
    $travelTypeClause = "";
    $i = 0;
    foreach ($travelTypeArray as $type) {
        if ($i == 0)
            $travelTypeClause = "$tableTourist.TRAVEL_STYLE LIKE '%$type%'";
        else
            $travelTypeClause = "$travelTypeClause AND $tableTourist.TRAVEL_STYLE LIKE '%$type%'";
        $i++;
    }
}


//GENERATED MAIN CLAUSE
$sql = "
SELECT $tableTourist.UID,
$tableTourist.AGE,
$tableTourist.GENDER,
$tableTourist.TRAVEL_STYLE,
$tableTourist.USERNAME,
GROUP_CONCAT(
    CONCAT($tableLocation.LAT,           \",\" ,
           $tableLocation.LNG,           \",\" ,
           $tablePost.REVIEW_ID,         \",\" ,
           $tableLocation.PLACE_NAME,    \",\" ,
           $tableLocation.PLACE_DETAILS, \",\" ,
           $tableLocation.PLACE_RATE,    \",\" ,
           $tablePost.REVIEW_RATE,       \",\" ,
           $tablePost.REVIEW_DATE)
           ORDER BY $tableTourist.UID, REVIEW_ID ASC SEPARATOR '|') as PATHS
FROM $tableLocation JOIN $tablePost ON $tableLocation.ID = $tablePost.ID
JOIN $tableTourist ON $tablePost.UID = $tableTourist.UID";


//ADDED WHERE CLAUSE
$sqlClause = "notSet";
if ($sqlClause1 != "notSet" && $sqlClause2 != "notSet") {
    $sqlClause = "$sqlClause1 AND $sqlClause2";
} else if ($sqlClause1 != "notSet") {
    $sqlClause = "$sqlClause1";
} else if ($sqlClause2 != "notSet") {
    $sqlClause = "$sqlClause2";
}
//DATE FROM-TO WHERE CLAUSE
if ($sqlClause != "notSet")
    $sql = $sql . " WHERE " . $sqlClause;
//TRAVEL-TYPE WHERE CLAUSE
if ($travelTypeClause != "notSet") {
    if (strpos($sql, "WHERE") !== false) {
        $sql = "$sql AND $travelTypeClause";
    } else {
        $sql = "$sql WHERE $travelTypeClause";
    }
}

//ADDED GROUP BY
$sql = $sql . " GROUP BY $tableTourist.UID";
//$sql = $sql . " WHERE $tableTourist.UID = \"00907B015DB72C5E2E3A4F48B6F0C353\" GROUP BY $tableTourist.UID";

//ADDED LIMIT PER REQUEST
if ($page . "" != "notSet") {
    $sql = "$sql LIMIT 36000 OFFSET " . $page * 36000;
}

//UNCOMMENT FOR SQL QUERY
//echo $sql;
//return 0;


//GENERATING RESPONSE
try {
    $db = new db();
    $db = $db->connect();
    $db->query("SET SESSION group_concat_max_len = 1000000;");
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    $a = 0;
    $users = array();

    if ($pathSpan == "notSet")
        $pathTimeSpan = 50000000; //Means a century of days
    else $pathTimeSpan = $pathSpan;

    $lastDate = 0;
    $response = array();
    foreach ($data as $userObject) {
        $uid = $userObject->UID;
        $age = $userObject->AGE;
        $gender = $userObject->GENDER;
        $travel_style = $userObject->TRAVEL_STYLE;
        $username = $userObject->USERNAME;
        $paths = $userObject->PATHS;

        $element = array();
        $element["UID"] = $uid;
        $element["AGE"] = $age;
        $element["GENDER"] = $gender;
        $element["TRAVEL_STYLE"] = $travel_style;
        $element["USERNAME"] = $username;


        $pathsEdited = array();
        $pathDataGlobal = array();
        $dateStart = 0;
        $dateEnd = 0;

        $locationsArray = explode("|", $paths);
        foreach ($locationsArray as $location) {
            $locationArray = explode(",", $location);


            $pathDataInternal = array();

            $pathDataInternal["LAT"] = $locationArray[0];
            $pathDataInternal["LNG"] = $locationArray[1];
            $pathDataInternal["REVIEW_ID"] = $locationArray[2];
            $pathDataInternal["PLACE_NAME"] = $locationArray[3];
            $pathDataInternal["PLACE_DETAILS"] = $locationArray[4];
            $pathDataInternal["PLACE_RATE"] = $locationArray[5];
            $pathDataInternal["REVIEW_RATE"] = $locationArray[6];
            $pathDataInternal["REVIEW_DATE"] = $locationArray[7];


            //We save end date every time
            $dateEnd = $locationArray[7];

            //We save start date first time
            if ($dateStart == 0) {
                $dateStart = $locationArray[7];
            }

            //If span is ok, then we add location to path otherwise we create new array and reset dateStart
            if (subtractDays($dateEnd, $dateStart) < $pathTimeSpan) {
                $pathDataGlobal[] = $pathDataInternal;
            } else {
                $pathsEdited[] = $pathDataGlobal;
                $pathDataGlobal = array();
                $pathDataGlobal[] = $pathDataInternal;
                $dateStart = $dateEnd;
            }
        }
        //We add last path to paths... last path is also just one path if user has just one
        if (sizeof($pathDataGlobal) != 0)
            $pathsEdited[] = $pathDataGlobal;

        $element["PATHS"] = $pathsEdited;
        $response[$uid] = $element;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo $e->getMessage();
}


function subtractDays($date1, $date2)
{
    $a = intval(strtotime($date2));
    $b = intval(strtotime($date1));
    $seconds = $b - $a;
    $minutes = $seconds / 60;
    $hours = $minutes / 60;
    $days = $hours / 24;
    return intval($days);
}