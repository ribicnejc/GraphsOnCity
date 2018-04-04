<?php
require 'db.php';

$databaseName = "tripviennar";
//$databaseName = "okpgr";

$sql = "SELECT COUNT(ID) as `COUNT_SIZE`, AVG(LAT) as `AVG_LAT`, AVG(LNG) as `AVG_LNG` FROM $databaseName";

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
        $newData["COUNT_SIZE"] = intval($dbCount);
        $newData["REQUEST_NUM"] = intval(ceil(intval($dbCount) / 36000.0));
        $newData["AVG_LAT"] = doubleval($latAvg);
        $newData["AVG_LNG"] = doubleval($lngAvg);
    }


    echo json_encode($newData, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo $e->getMessage();
}