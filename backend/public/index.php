<?php
/**
 * Entry Point - Walmart Uganda E-Commerce
 *
 * This is the main entry point for all API requests
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Define base path
define('BASEPATH', dirname(__DIR__) . DIRECTORY_SEPARATOR);

// Load environment configuration
if (file_exists(BASEPATH . '.env')) {
    $env_file = file(BASEPATH . '.env');
    foreach ($env_file as $line) {
        $line = trim($line);
        if (!empty($line) && strpos($line, '=') !== false && $line[0] !== '#') {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Database connection
try {
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $database = $_ENV['DB_DATABASE'] ?? 'walmart_uganda';
    $username = $_ENV['DB_USERNAME'] ?? 'root';
    $password = $_ENV['DB_PASSWORD'] ?? '';

    $pdo = new PDO(
        "mysql:host=$host;dbname=$database",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Route parsing
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Remove base path from URI
$base_url = '/walmart-uganda/backend/public';
if (strpos($request_uri, $base_url) === 0) {
    $request_uri = substr($request_uri, strlen($base_url));
}
if (empty($request_uri)) {
    $request_uri = '/';
}

// Route handler
$routes = [
    'GET' => [
        '/api/v1/products' => 'getProducts',
        '/api/v1/products/:id' => 'getProduct',
    ],
];

// Simple routing
if ($request_uri === '/api/v1/products' && $request_method === 'GET') {
    handleGetProducts($pdo);
} elseif (preg_match('/^\/api\/v1\/products\/(\d+)$/', $request_uri, $matches) && $request_method === 'GET') {
    handleGetProduct($pdo, $matches[1]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

/**
 * Get all products
 */
function handleGetProducts($pdo) {
    try {
        $page = intval($_GET['page'] ?? 1);
        $per_page = intval($_GET['per_page'] ?? 20);
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $offset = ($page - 1) * $per_page;

        $query = 'SELECT * FROM products WHERE 1=1';
        $params = [];

        if ($category) {
            $query .= ' AND category_id = ?';
            $params[] = $category;
        }

        if ($search) {
            $query .= ' AND (name LIKE ? OR description LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $query .= ' LIMIT ' . $per_page . ' OFFSET ' . $offset;

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $products,
            'page' => $page,
            'per_page' => $per_page,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

/**
 * Get single product
 */
function handleGetProduct($pdo, $id) {
    try {
        $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $product,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
