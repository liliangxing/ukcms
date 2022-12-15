<?php
/**
 * Created by IntelliJ IDEA.
 * User: lilx
 * Date: 2019/3/30
 * Time: 10:15
 */
$a = [5,4,3,2,1,33,44,12,32,0,12,3,211,33,212];

$n = count($a);
for($i=0;$i<$n;$i++){
    echo $a[$i]."、";
}

for($i=0; $i<$n-1; $i++){
    for($j=$i+1; $j<$n; $j++){
        if($a[$i]>$a[$j]){
            $t = $a[$i];
            $a[$i] = $a[$j];
            $a[$j]=$t;
        }
    }
}
echo "<br>";
for($i=0;$i<$n;$i++){
    echo $a[$i]."、";
}