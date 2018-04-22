<?php

class db
{
    // Host
//    private $dbhost = "localhost";
//    private $dbuser = "nejcribic_nejc";
//    private $dbpass = "*piF5(QE4xlKw";
//    private $dbname = "nejcribic_test";

    // Local
    private $dbhost = "localhost";
    private $dbuser = "root";
    private $dbpass = "";
    private $dbname = "nejcribic_test";

    //BerryPi
//    private $dbhost = "localhost";
//    private $dbuser = "phpmyadmin";
//    private $dbpass = "ribic";
//    private $dbname = "nejcribic_test";



    // Connect
    public function connect()
    {
        $mysql_connect_str = "mysql:host=$this->dbhost;dbname=$this->dbname";
        $dbConnection = new PDO($mysql_connect_str, $this->dbuser, $this->dbpass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
        $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbConnection;
    }
}
