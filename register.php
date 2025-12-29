<?php
include "db.php";

$name     = $_POST['name'];
$username = $_POST['username'];
$password = $_POST['password'];

$sql = "INSERT INTO users (name, username, password) 
        VALUES ('$name', '$username', '$password')";

if ($conn->query($sql)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}
?>
