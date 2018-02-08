<?php
$params = explode(",", $argv[1]);
$file = file_get_contents($params[0], true);
echo $file;
?>