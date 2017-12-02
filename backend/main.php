<?php
//title, date, username, lat, lng, description

$file = fopen('../data/testData.csv', 'r');
//$file = fopen('../data/editedData.csv', 'r');
$lineNumber = 0;
$allDataArray = array();
$attributes = array();
while (($line = fgetcsv($file)) !== FALSE) {
    if ($lineNumber == 0) {
        $attributes = $line;
        for ($i = 0; $i < sizeof($attributes); $i++) {
            $attributes[$i] = ltrim($attributes[$i]."");
        }
    }else {
        $i = 0;
        $lineDataArray = array();
        foreach ($line as $element){
            //replace first spaces in attribute value
            $element = ltrim($element);
            $attribute = $attributes[$i];
            if ($attribute == "lat" || $attribute == "lng") {
                $element = floatval($element);
            }
            $lineDataArray[$attribute] = $element;
            $i++;
        }
        array_push($allDataArray, $lineDataArray);
    }
    $lineNumber++;
}
fclose($file);
echo json_encode($allDataArray);