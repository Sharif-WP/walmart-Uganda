<?php
// Migration placeholder: create products table (already created in SQL file)
return function($pdo){
    $sql = "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    )";
    $pdo->exec($sql);
};
