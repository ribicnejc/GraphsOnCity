<?php
require '../backend/db.php';

if (isset($_GET['city'])) {
    $databaseName = $_GET['city'];
}

$sql = "SELECT DISTINCT PLACE_NAME, LAT, LNG FROM $databaseName ";

try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo "num, address, lat, lng" . "</br>";
    $i = 0;
    foreach ($data as $myObject) {
        $dbPlaceName = $myObject->PLACE_NAME;
        $dbPlaceLng = $myObject->LNG;
        $dbPlaceLat = $myObject->LAT;
        $dbPlaceName = str_replace("\"", "", $dbPlaceName);
        echo "$i: $dbPlaceName, $dbPlaceLat, $dbPlaceLng" . "</br>";
        $i++;
    }
} catch (PDOException $e) {
    echo $e->getMessage();
}