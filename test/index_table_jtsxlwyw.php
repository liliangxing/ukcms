<?php
session_start();
if (empty($page)) {$page=1;}
if (isset($_GET['page'])==TRUE) {$page=$_GET['page']; }
$conn = mysql_connect('mysql.sql174.cdncenter.net','sq_ukcms','xingli000000aaa') or die("Invalid query: " . mysql_error());
mysql_select_db('sq_ukcms', $conn) or die("Invalid query: " . mysql_error());
 mysql_query("SET NAMES utf8",$conn);


$counter=file_get_contents("txt/jtsxlwyw/liujiao2004.txt"); //读取txt文件内容到$counter
$counter = iconv("GBK", "UTF-8", $counter);
$length=mb_strlen($counter);
$pageLength = 6600;
$page_count=ceil($length/$pageLength);
$i=$page;
for($i = 1 ;$i<$page_count+1 ; $i++){

    $c=mb_substr($counter,0,($i-1)*$pageLength);
    $c1=mb_substr($counter,0,$i*$pageLength);

    $file = mb_substr($c1,mb_strlen($c),mb_strlen($c1)-mb_strlen($c));
    $articleId= 547 + $i;


$title = '净土圣贤录文言文-第'.$i.'页';
$fields = array('info');
$table = 'uk_article';
$result = loadTxtDataIntoDatabase($articleId,$title,$file,$i,$table,$conn,$fields);
if (array_shift($result)){
  echo 'Success!<br/>';
}else {
  echo 'Failed!--Error:'.array_shift($result).'<br/>';
}


    }





function loadTxtDataIntoDatabase($articleId,$title,$file,$i,$table,$conn,$fields=array(),$insertType='INSERT'){
  if(empty($fields)) {$head = "{$insertType} INTO `{$table}` VALUES('";}
  else {
      $head = "{$insertType} INTO `{$table}`(`id`, `cname`, `ifextend`, `uid`, `places`, `title`, `create_time`, `update_time`, `orders`, `status`, `hits`, `source`, `description`, `cover`, `keywords`, `color`, `content`) VALUES
      ( '".$articleId."', 'jtsxlwyw', 0, 1, '', '".$title."',  '0',  '0', '".$i."', 1, 0, '', '', 0, '".$title."', ''";
  }  //数据头

    $sqldata = trim($file);
    $sqldata = str_replace("'","\'",$sqldata);
    $sqldata = str_replace("\r\n\r\n\r\n","\r\n\r",$sqldata);
    $sqldata = str_replace("\r\n\r\n","<br/><br/>",$sqldata);
    $sqldata = str_replace("\r\n","<br/>",$sqldata);
    $sqldata = str_replace("●●","<br/>　　",$sqldata);
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