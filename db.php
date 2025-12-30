<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "fire_detect"; // 🔥 FIX DI SINI

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>
