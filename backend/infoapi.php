<?php
require 'db.php';

//$databaseName = "tripViennaR";
$databaseName = "okpgR";
//$databaseName = "ljubljanaR";

if (isset($_GET['city'])) {
    $databaseName = $_GET['city'];
}

$sql = "SELECT 
COUNT(ID) as `COUNT_SIZE`, 
AVG(LAT) as `AVG_LAT`, 
AVG(LNG) as `AVG_LNG`, 
MIN(REVIEW_DATE) as MIN_DATE, 
MAX(REVIEW_DATE) as MAX_DATE 
FROM $databaseName";

try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    $newData = array();

    foreach ($data as $myObject) {
        $dbCount = $myObject->COUNT_SIZE;
        $latAvg = $myObject->AVG_LAT;
        $lngAvg = $myObject->AVG_LNG;
        $minDate = $myObject->MIN_DATE;
        $maxDate = $myObject->MAX_DATE;
        $newData["COUNT_SIZE"] = intval($dbCount);
        $newData["REQUEST_NUM"] = intval(ceil(intval($dbCount) / 36000.0));
        $newData["AVG_LAT"] = doubleval($latAvg);
        $newData["AVG_LNG"] = doubleval($lngAvg);
        $newData["MIN_DATE"] = intval($minDate);
        $newData["MAX_DATE"] = intval($maxDate);
    }


    echo json_encode($newData, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo $e->getMessage();
}