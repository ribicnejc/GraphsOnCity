<?php
$file = "../data/testData.csv";
$csv = file_get_contents($file);
$array = array_map("str_getcsv", explode("\n", $csv));
echo json_encode($array);