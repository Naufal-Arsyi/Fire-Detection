<?php
include "db.php";

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username='$username' LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    if ($row['password'] === $password) {
        echo json_encode([
            "status" => "success",
            "user" => [
                "id" => $row["id"],
                "name" => $row["name"]
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Password salah"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User tidak ditemukan"]);
}
?>
