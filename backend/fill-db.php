<?php
require 'db.php';


$file = fopen('../data/data_edited_test.csv', 'r');
$lineNumber = 0;
$columns;
$values = "";
$place_name;
$place_details;
$lat;
$lng;
$review_date;
$place_rate;
$review_rate;
$age;
$gender;
$username;
$uid;
$travel_style;

while (($line = fgetcsv($file)) !== FALSE) {
    if ($lineNumber == 0) {
        $place_name = $line[0];
        $place_details = $line[1];
        $lat = $line[2];
        $lng = $line[3];
        $review_date = $line[4];
        $place_rate = $line[5];
        $review_rate = $line[6];
        $age = $line[7];
        $gender = $line[8];
        $username = $line[9];
        $uid = $line[10];
        $travel_style = $line[11];

        $columns = "($place_name, $place_details, $lat, $lng, $review_date, $place_rate, $review_rate, $age, $gender, $username, $uid, $travel_style)";
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

        if ($values === "") {
            $values = $values . " ($place_name, $place_details, $lat, $lng, $review_date, $place_rate, $review_rate, $age, $gender, $username, $uid, $travel_style)";
        } else {
            $values = $values . ", ($place_name, $place_details, $lat, $lng, $review_date, $place_rate, $review_rate, $age, $gender, $username, $uid, $travel_style)";
        }
    }


    $lineNumber++;
}
fclose($file);
$sql = "INSERT INTO trip $columns VALUES $values";

try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->prepare($sql);
    $stmt->execute();
    echo "Successfully filled database";
} catch (PDOException $e) {
    echo $e->getMessage();
}