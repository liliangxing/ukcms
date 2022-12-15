<?php

function DoubleBall(){

    $sysBlueball = mt_rand(1,16);

    $sysRedball = array(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33);

    $result = array();

    for($i=0; $i<6; $i++)

    {

        while(true)

        {

            $index = mt_rand(0,32);

            if($sysRedball[$index] != 0){

                $result[$i] = $sysRedball[$index];

                $sysRedball[$index] = 0;

                break;

            }

        }

    }

    $result = implode(',',$result);

    echo '\n'.$sysBlueball.'';

    echo ' 蓝'.$result.'';

}
for($i=0; $i<48; $i++) {
    DoubleBall();
}