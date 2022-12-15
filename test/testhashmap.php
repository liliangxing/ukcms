<?php
require_once 'hashMap.php';
$hashMap=new HashMap();
for($i=0; $i<10000; $i++){
    $hashMap->put($i,rand(2, $i));
    $hashMap->put($i,rand(100, $i));
}
for($i=1; $i<10; $i++) {
    $hashMap->remove(rand(100, 10000));
}

$hashMap->remove(rand(100, 10000));