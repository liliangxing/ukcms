<?php
require_once '../extend/str/FanJianConvert.php';
use str\FanJianConvert;
session_start();
if (!isset($_GET['cname'])) {return; }
$cname = $_GET['cname'];
$conn = mysql_connect('mysql.sql174.cdncenter.net','sq_ukcms','xingli000000aaa') or die("Invalid query: " . mysql_error());
mysql_select_db('sq_ukcms', $conn) or die("Invalid query: " . mysql_error());
mysql_query("SET NAMES utf8",$conn);

$path = 'txt/'.$cname.'/';
$arr = FanJianConvert::getDirContent($path);

for($i = 1 ;$i<count($arr)+1 ; $i++){
    if(strlen($i) == 1){
        $where2= "00".$i;
    }
    if(strlen($i) == 2){
        $where2= "0".$i;
    }
    if(strlen($i) == 3){
        $where2= $i;
    }
    $where3 = $path.$arr[$i-1];
    $file = file_get_contents($where3);
    $encode = FanJianConvert::get_encoding($file);
    // 转换成"UTF-8"编码
    if($encode != 'UTF-8'){
        $file = mb_convert_encoding($file, "UTF-8", $encode);
    }
        $file = FanJianConvert::tradition2simple($file);

    $str = strtok($file, "\n");
    $titleOne="";
    for($ik = 0; $ik < strlen($str); $ik++)
    {
        if(is_numeric($str[$ik]))
        {
           break;
        }
        $titleOne .=$str[$ik];
    }
    preg_match_all('/[\x{4e00}-\x{9fff}]+/u', $str, $cn_name);
    $titleTwo = $cn_name[0][0];
    $title = $titleTwo.'-第'.$where2.'集';
    if(count($arr)<2){
        $title = trim($titleOne);
    }
    $fields = array('info');
    $table = 'uk_article';
    $result = loadTxtDataIntoDatabase($title,$cname,$file,$i,$table,$conn,$fields);

    if (array_shift($result)){
        echo 'Success!<br/>';
    }else {
        echo 'Failed!--Error:'.array_shift($result).'<br/>';
    }


}


function loadTxtDataIntoDatabase($title,$cname,$file,$i,$table,$conn,$fields=array(),$insertType='INSERT'){
    if(empty($fields)) {$head = "{$insertType} INTO `{$table}` VALUES('";}
    else {
        $head = "{$insertType} INTO `{$table}`(`cname`, `ifextend`, `uid`, `places`, `title`, `create_time`, `update_time`, `orders`, `status`, `hits`, `source`, `description`, `cover`, `keywords`, `color`, `content`) VALUES
      ('".$cname."', 0, 1, '', '".$title."',  '0',  '0', '".$i."', 1, 0, '', '', 0, '".$title."', ''";
    }  //数据头

    $sqldata = trim($file);
    $sqldata = str_replace("'","\'",$sqldata);
    $sqldata = str_replace("\r\n\r\n","\r\n",$sqldata);
    $sqldata = str_replace("\r\n","<br/>",$sqldata);
    $sqldata = str_replace("　　 ","　　",$sqldata);
    $end = ", '".$sqldata."');";


    $query = $head.$end;  //数据拼接


    if(mysql_query($query,$conn)){

        var_dump(mysql_insert_id());
        return array(true);}
    else {
        return array(false,mysql_error($conn),mysql_errno($conn));
    }
}

?>