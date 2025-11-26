<?php
return function($pdo){
    $sql = "CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255));";
    $pdo->exec($sql);
};
