<?php

class db
{

    private $DEPLOY_TARGET = 0;

    private $dbhost = null;
    private $dbuser = null;
    private $dbpass = null;
    private $dbname = null;

    // Connect
    public function connect()
    {
        $this->setDeploymentTarget($this->DEPLOY_TARGET);
        $mysql_connect_str = "mysql:host=$this->dbhost;dbname=$this->dbname";
        $dbConnection = new PDO($mysql_connect_str, $this->dbuser, $this->dbpass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8'"));
        $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $dbConnection;
    }

    private function setDeploymentTarget($DEPLOYMENT_TARGET) {
        switch ($DEPLOYMENT_TARGET) {
            case 0:
                //LOCALHOST
                $this->dbhost = "localhost";
                $this->dbuser = "root";
                $this->dbpass = "";
                $this->dbname = "nejcribic_test";
                break;
            case 1:
                //HOST
                $this->dbhost = "localhost";
                $this->dbuser = "nejcribic_nejc";
                $this->dbpass = "*piF5(QE4xlKw";
                $this->dbname = "nejcribic_test";
                break;
            case 2:
                //BERRY PI
                $this->dbhost = "localhost";
                $this->dbuser = "phpmyadmin";
                $this->dbpass = "ribic";
                $this->dbname = "nejcribic_test";
                break;
            case 3:
                //HOME SERVER
                $this->dbhost = "localhost";
                $this->dbuser = "root";
                $this->dbpass = "ribic";
                $this->dbname = "nejcribic_test";
                break;
        }
    }
}
