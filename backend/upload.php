<?php
/**
 * Hostinger Backend API for IndianToolsHub Profile Avatars
 * 
 * INSTRUCTIONS FOR HOSTINGER:
 * 1. Create a folder on your Hostinger public_html named `api` (or similar).
 * 2. Upload this `upload.php` file into it.
 * 3. Create a folder named `avatars` right next to this file.
 * 4. Ensure the `avatars` folder has write permissions (chmod 755).
 * 5. Change $SECRET_TOKEN below to a long random password and put that same password in your GitHub Secrets as NEXT_PUBLIC_UPLOAD_SECRET.
 */

// --- SECURITY CONFIGURATION ---
// ONLY accept requests from this exact URL. No trailing slash!
$ALLOWED_ORIGIN = 'https://zestcommerce841428-png.github.io'; 

// This token must match what the React app sends. Change this!
$SECRET_TOKEN = 'SUPER_SECRET_TOKEN_CHANGE_ME_12345'; 
// ------------------------------

// Set strict CORS Headers
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $ALLOWED_ORIGIN) {
    header("Access-Control-Allow-Origin: " . $ALLOWED_ORIGIN);
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
} else {
    // If the origin doesn't match or is empty, we reject it.
    header("HTTP/1.1 403 Forbidden");
    echo json_encode(["error" => "Forbidden. Origin not allowed."]);
    exit;
}

// Handle Preflight (OPTIONS) request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header('Content-Type: application/json');

// Verify POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Only POST is supported."]);
    exit;
}

// Verify Authorization Token
$headers = apache_request_headers();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
if ($authHeader !== 'Bearer ' . $SECRET_TOKEN) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized. Invalid secret token."]);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "No file uploaded or an upload error occurred."]);
    exit;
}

$file = $_FILES['avatar'];

// Basic validation
$maxSize = 2 * 1024 * 1024; // 2MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(["error" => "File exceeds 2MB limit."]);
    exit;
}

// Validate MIME type to ensure it's an image
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $allowedMimeTypes)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed."]);
    exit;
}

// Determine file extension
$extension = 'jpg';
if ($mimeType === 'image/png') $extension = 'png';
if ($mimeType === 'image/webp') $extension = 'webp';
if ($mimeType === 'image/gif') $extension = 'gif';

// Require a UID passed in POST body to bind the avatar to a user
if (!isset($_POST['uid']) || empty($_POST['uid'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing User ID."]);
    exit;
}

$uid = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['uid']); // Sanitize UID

// Construct unique filename: avatar_UID_TIMESTAMP.ext
$fileName = 'avatar_' . $uid . '_' . time() . '.' . $extension;
$uploadDir = __DIR__ . '/avatars/';

// Create avatars directory if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Optional: Delete old avatar for this UID to save space
$existingFiles = glob($uploadDir . 'avatar_' . $uid . '_*.*');
foreach ($existingFiles as $oldFile) {
    if (is_file($oldFile)) {
        unlink($oldFile); // Delete old avatar
    }
}

// Move uploaded file
$destination = $uploadDir . $fileName;
if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Build public URL dynamically
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $path = str_replace($_SERVER['DOCUMENT_ROOT'], '', __DIR__);
    
    // Fallback if path manipulation fails
    if (empty($path)) {
        $path = dirname($_SERVER['REQUEST_URI']);
    }
    
    $path = rtrim($path, '/');
    $publicUrl = $protocol . "://" . $host . $path . "/avatars/" . $fileName;

    echo json_encode([
        "success" => true,
        "url" => $publicUrl
    ]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to save file to server."]);
}
