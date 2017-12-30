<?php
require 'db.php';

//TODO CTRL + F5 to hard refresh web site without cookies: Xampp Fix

//$file = fopen('../data/data_edited_test.csv', 'r');
$file = fopen('../data/DATA_EDITED_3.csv', 'r');
$lineNumber = 0;
$columns = "";
$values = "";
$place_name = "";
$place_details = "";
$lat = "";
$lng = "";
$review_date = "";
$place_rate = "";
$review_rate = "";
$age = "";
$gender = "";
$username = "";
$uid = "";
$travel_style = "";

while (($line = fgetcsv($file)) !== FALSE) {
    if ($lineNumber == 0) {
        $place_name = ltrim(strtoupper($line[0]));
        $place_details = ltrim(strtoupper($line[1]));
        $lat = ltrim(strtoupper($line[2]));
        $lng = ltrim(strtoupper($line[3]));
        $review_date = ltrim(strtoupper($line[4]));
        $place_rate = ltrim(strtoupper($line[5]));
        $review_rate = ltrim(strtoupper($line[6]));
        $age = ltrim(strtoupper($line[7]));
        $gender = ltrim(strtoupper($line[8]));
        $username = ltrim(strtoupper($line[9]));
        $uid = ltrim(strtoupper($line[10]));
        $travel_style = ltrim(strtoupper($line[11]));
        $columns = "(`$place_name`, `$place_details`, `$lat`, `$lng`, `$review_date`, `$place_rate`, `$review_rate`, `$age`, `$gender`, `$username`, `$uid`, `$travel_style`)";
    } else {
        $place_name = $line[0];
        $place_details = $line[1];
        $lat = floatval($line[2]);
        $lng = floatval($line[3]);
        $review_date = intval($line[4]);
        $place_rate = floatval($line[5]);
        $review_rate = floatval($line[6]);
        $age = $line[7];
        $gender = $line[8];
        $username = $line[9];
        $uid = $line[10];
        $travel_style = $line[11];

        $values = $values . "INSERT INTO trip $columns VALUES (\"$place_name\", '$place_details', $lat, $lng, $review_date, $place_rate, $review_rate, \"$age\", \"$gender\", \"$username\", \"$uid\", \"$travel_style\");";
        echo $values;
    }


    $lineNumber++;
}
//INSERT INTO `trip`(`PLACE_NAME`, `PLACE_DETAILS`, `LAT`, `LNG`, `USERNAME`, `REVIEW_DATE`, `UID`, `PLACE_RATE`, `REVIEW_RATE`, `TRAVEL_STYLE`, `AGE`, `GENDER`) VALUES ("A","B & C",7.1213454,7.44444444,"E",333333,"aadadad",5.0,3,"A&e","45+","male")
fclose($file);
//$sql = "INSERT INTO trip $columns VALUES $values ;";
$sql = $values;
//echo $sql;
try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->prepare($sql);
    $stmt->execute();
    echo "Successfully filled database";
} catch (PDOException $e) {
    echo $e->getMessage();
}