<?php

class db
{
    // Properties
//    private $dbhost = "localhost";
//    private $dbuser = "nejcribic_nejc";
//    private $dbpass = "*piF5(QE4xlKw";
//    private $dbname = "nejcribic_test";

    // Local Properties
    private $dbhost = "localhost";
    private $dbuser = "root";
    private $dbpass = "";
    private $dbname = "nejcribic_test";

    // Connect
    public function connect()
    {
        $mysql_connect_str = "mysql:host=$this->dbhost;dbname=$this->dbname";
        $dbConnection = new PDO($mysql_connect_str, $this->dbuser, $this->dbpass);
        $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbConnection;
    }
}