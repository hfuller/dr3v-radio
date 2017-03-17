<?php

$db = new PDO('sqlite:radio.sqlite3');
$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

if ( $_SERVER['REQUEST_METHOD'] === 'POST' ) {
	$st = $db->prepare("SELECT * FROM settings WHERE key = 'password' and value = ?;");
	$st->execute(array($_POST['password']));

	if ( $st->fetch() === false ) {
		die(json_encode(false));
	}

	//password is valid.
	foreach ( array('dj-name', 'show-name', 'album-art-url', 'requests-enabled') as $key ) {
		if ( array_key_exists($key, $_POST) ) {
			$st = $db->prepare("UPDATE settings SET value = ? where key = ?");
			$st->execute(array((string) $_POST[$key], $key));
		}
	}

	die(json_encode(true));
}
