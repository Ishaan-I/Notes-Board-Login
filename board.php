<?php
session_start();

$fileName = 'notes.json';

$name = "";
$email = "";

if (!isset($_SESSION['user'])) {
    header('Location: signin.php');
    exit;
} else {
    $name = $_SESSION['user']['name'];
    $email = $_SESSION['user']['email'];
}

if (!file_exists($fileName)) file_put_contents($fileName, "{}");

$allNotes = json_decode(file_get_contents($fileName), true);
if (!$allNotes) $allNotes = [];

if (isset($_POST['saveData'])) {
    $newNotes = json_decode($_POST['saveData'], true);

    $allNotes = json_decode(file_get_contents($fileName), true);
    if (!$allNotes) $allNotes = [];

    $allNotes[$email] = $newNotes ?: new stdClass();

    file_put_contents($fileName, json_encode($allNotes, JSON_PRETTY_PRINT));

    header('Location: board.php');
    exit;
}

$usernotes = $allNotes[$email] ?? [];

if (empty($usernotes)) $usernotes = new stdClass();

echo "<script>const savedNotes = " . json_encode($usernotes) . "</script>";
?>

<!DOCTYPE html>
<html>
    <head>
        <title>Dashboard</title>
        <link rel="stylesheet" href="board.css">
    </head>

    <body>
        <h1><?php echo "<h1>$name's Board</h1>"; ?></h1>
        <div id="ghost"></div>
        <div id="colour-menu"></div>
        <div id="ui-buttons">
            <form method="POST" id="saveForm">
                <input type="hidden" name='saveData' id="notesData">
                <button type="submit" class="uiBtn">💾</button>
            </form>
            <button class="uiBtn" id="clearBtn">🗑️</button>
            <a href="signout.php" class="uiBtn">🚪</a>
        </div>

        <script src="board.js"></script>
    </body>
</html>