<?php
header("Access-Control-Allow-Origin:*");
header('Access-Control-Allow-Headers:x-requested-with,content-type');
header('Content-Type:application/json; charset=utf-8');
$mypost = json_decode(file_get_contents('php://input'), true);
file_put_contents("./upload/json_data.txt", file_get_contents('php://input'));
exit($GLOBALS['HTTP_RAW_POST_DATA']);