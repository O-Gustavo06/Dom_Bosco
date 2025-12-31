<?php

class Database
{
    private static $connection = null;

    public static function connect()
    {
        if (self::$connection === null) {

            $path = 'C:/xampp/htdocs/Dom_Bosco/BANCO.db';

            if (!file_exists($path)) {
                die('Banco SQLite não encontrado em: ' . $path);
            }

            self::$connection = new PDO("sqlite:$path");
            self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$connection->exec('PRAGMA foreign_keys = ON');
        }

        return self::$connection;
    }
}
