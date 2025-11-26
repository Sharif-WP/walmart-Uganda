<?php
// Migration placeholder
return function($pdo){
    $sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255));";
    $pdo->exec($sql);
};
