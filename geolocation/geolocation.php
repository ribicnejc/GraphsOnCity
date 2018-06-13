<?php
require '../backend/db.php';

if (isset($_GET['city'])) {
    $databaseName = $_GET['city'];
}

$sql = "SELECT DISTINCT PLACE_NAME FROM $databaseName LIMIT 100 OFFSET 500";

try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;


//    var addresses = ['valburga 22', 'ljubljana', 'rijeka'];
//    $newData = array();
//    echo "var addresses = [";
//    echo "</br>";
//    $i = 0;
//    foreach ($data as $myObject) {
//        $dbPlaceName = $myObject->PLACE_NAME;
//        echo "\"".$dbPlaceName."\"";
//        echo ", ";
//        $i++;
//    }
//    echo "''];";


    echo "var addresses = \"";
    $i = 0;
    foreach ($data as $myObject) {
        $dbPlaceName = $myObject->PLACE_NAME;
        $dbPlaceName = str_replace("\"", "", $dbPlaceName);
        echo $dbPlaceName." Vienna"."&&";
        $i++;
    }
    echo "\";";
} catch (PDOException $e) {
    echo $e->getMessage();
}