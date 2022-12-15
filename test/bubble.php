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

for($i=0; $i<$n; $i++){
    for($j=0; $j<$n-1; $j++){
        if($a[$j]>$a[$j+1]){
            $t = $a[$j+1];
            $a[$j+1] = $a[$j];
            $a[$j]=$t;
        }
    }
}
echo "<br>";
for($i=0;$i<$n;$i++){
    echo $a[$i]."、";
}