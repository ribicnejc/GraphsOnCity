<?php

$file = fopen('new-coords-ljubljana.csv', 'r');

$lineNumber = 0;
$allDataArray = array();
$attributes = array();
echo "var markers3 = \"";
while (($line = fgetcsv($file)) !== FALSE) {
    if ($lineNumber != 0) {
        $lineDataArray = array();
        $i = 0;
        $adr = "";
        $lat = "";
        $lng = "";
        foreach ($line as $element) {
            if ($i == 0) {
                $adr = $element;
            }
            if ($i == 1) {
                $lat = $element;
            }
            if ($i == 2) {
                $lng = $element;
            }

            $i++;
        }

        if (strpos($adr, '#restaurant') === false)
            echo "$lat, $lng, $adr:";


    }

    $lineNumber++;
}
echo "\";";
fclose($file);
//echo json_encode($allDataArray);

