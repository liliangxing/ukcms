<?php
$conn = mysql_connect('127.0.0.1','root','123456') or die("Invalid query: " . mysql_error());
mysql_select_db('sq_ukcms', $conn) or die("Invalid query: " . mysql_error());
 mysql_query("SET NAMES utf8",$conn);



for($i = 1 ;$i<509 ; $i++){
        if(strlen($i) == 1){
            $where2= "00".$i;
        }
        if(strlen($i) == 2){
            $where2= "0".$i;
        }
        if(strlen($i) == 3){
            $where2= $i;
        }


$where3 = 'fulltextzip_02-041_20190319_185419_20399100/02-041-0'.$where2.'_zh_CN.txt';
$title = '二零一四淨土大經科註-第'.$where2.'集';
$number3 = $where2;
$number1 = $i;
$splitChar = '|';  //竖线
$file = $where3;
$fields = array('info');
$table = 'uk_article';
$result = loadTxtDataIntoDatabase($title,$number3,$number1,$splitChar,$file,$table,$conn,$fields);
if (array_shift($result)){
  echo 'Success!<br/>';
}else {
  echo 'Failed!--Error:'.array_shift($result).'<br/>';
}


    }  









function loadTxtDataIntoDatabase($title,$number3,$number1,$splitChar,$file,$table,$conn,$fields=array(),$insertType='INSERT'){
  if(empty($fields)) {$head = "{$insertType} INTO `{$table}` VALUES('";}
  else {
      $head = "{$insertType} INTO `{$table}`(`cname`, `ifextend`, `uid`, `places`, `title`, `create_time`, `update_time`, `orders`, `status`, `hits`, `source`, `description`, `cover`, `keywords`, `color`, `sound_url`,`content`,`video_url`) VALUES( 'kezhu', 0, 1, '', '".$title."',  '0',  '0', 100, 1, 0, 'http://www.amtb.org.tw/bt/amtb_jindian.asp?web_choice=2&web_amtb_index=3526', '', 0, '".$title."', ''";
  }  //数据头

    $sqldata = trim(file_get_contents($file));
    $sqldata = str_replace("\r\n\r\n","<br/>",$sqldata);
    $sqldata = str_replace("\r\n","<br/>",$sqldata);
  $end = ", 'http://al-media.ciguang.tv/mp3/02/02-041/02-041-0".$number3.".mp3','".$sqldata."', 'http://cdn-media.jingzong.org/mp4/02/02-041/02-041-0".$number3.".mp4');";


  $query = $head.$end;  //数据拼接


  if(mysql_query($query,$conn)){

      var_dump(mysql_insert_id());
      return array(true);}
  else {
    return array(false,mysql_error($conn),mysql_errno($conn));
  }
}

 ?>