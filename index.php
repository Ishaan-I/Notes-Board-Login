<?php
function EmailAlreadyRegistered() {
    header("Location: register.php?error=email");
    exit;
}

$fileName = 'users.json';

if (!file_exists($fileName)) file_put_contents($fileName, "{}");

$users = json_decode(file_get_contents($fileName), true);

if (!is_array($users)) {
    $users = [];
}

if (isset($_POST['email'])) {
    if (isset($users[$_POST['email']])) {
        EmailAlreadyRegistered();
    } else {
        $newUser = [
            'name' => $_POST['name'],
            'hashedPass' => password_hash($_POST['password'], PASSWORD_DEFAULT)
        ];
        $users[$_POST['email']] = $newUser;
    }

    file_put_contents($fileName, json_encode($users, JSON_PRETTY_PRINT));

    header('Location: signin.php?registered=1');
    exit;
}
?>


<!DOCTYPE html>
<html>
    <head>
        <title>PHP User Registration</title>
        <link rel="stylesheet" href="login.css">
    </head>

    <body>
        <?php if (isset($_GET['error']) and $_GET['error'] === 'email'): ?>
            <script>alert('Email is already in use')</script>
        <?php endif; ?>
        <div class="container">
            <h2><u>Register</u></h2>

            <form method="POST">
                <div class="textInp">
                    <input class="textInpBox" type="text" name="name" placeholder="Name" required>
                    <input class="textInpBox" type="email" name="email" placeholder="Email" required>
                    <input class="textInpBox" type="password" name="password" placeholder="Password" required>
                </div>
                <input type="submit" value="Register" action="signin.php">
                <p>Already have an account? <a href="signin.php">Sign in</a></p>
            </form>
        </div>
    </body>
</html>
