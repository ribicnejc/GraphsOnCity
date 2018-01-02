<?php
require 'db.php';
$sql = "SELECT * FROM trip LIMIT 1000";
try {
    $db = new db();
    $db = $db->connect();
    $stmt = $db->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_OBJ);
    $db = null;
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}catch (PDOException $e) {
    echo $e->getMessage();
}