<?php
session_start();

$users = json_decode(file_get_contents('users.json'), true);

if (!is_array($users)) {
    $users = [];
}

if (isset($_POST['email'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    if (!isset($users[$email])) {
        header('Location: signin.php?error=invalid');
        exit;
    }

    if (!password_verify($password, $users[$email]['hashedPass'])) {
        header('Location: signin.php?error=invalid');
        exit;
    }

    $_SESSION['user'] = [
        'email' => $email,
        'name' => $users[$email]['name']
    ];

    header('Location: board.php');
    exit;
}
?>


<!DOCTYPE html>
<html>
    <head>
        <title>PHP Sign in</title>
        <link rel="stylesheet" href="login.css">
    </head>

    <body>
        <?php if (isset($_GET['error'])): ?>
            <script>alert('Invalid email or password')</script>
        <?php endif; ?>

        <div class="container">
            <h2><u>Sign in</u></h2>

            <form method="POST">
                <div class="textInp">
                    <input class="textInpBox" type="email" name="email" placeholder="Email" required>
                    <input class="textInpBox" type="password" name="password" placeholder="Password" required>
                </div>
                <input type="submit" value="Sign in">
                <p>Don't have an account? <a href="register.php">Register</a></p>
            </form>
        </div>
    </body>
</html>