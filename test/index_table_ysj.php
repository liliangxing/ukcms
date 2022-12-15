<?php
session_start();
if (empty($page)) {$page=1;}
if (isset($_GET['page'])==TRUE) {$page=$_GET['page']; }
$conn = mysql_connect('mysql.sql174.cdncenter.net','sq_ukcms','xingli000000aaa') or die("Invalid query: " . mysql_error());
mysql_select_db('sq_ukcms', $conn) or die("Invalid query: " . mysql_error());
 mysql_query("SET NAMES utf8",$conn);


$counter=file_get_contents("txt/yongsiji.txt"); //读取txt文件内容到$counter
$conn1=mb_convert_encoding($counter,"UTF-8","GBK");//设置不乱码
$arr = preg_split("/\r\n\t来佛三圣永思集\t/",$conn1);
$perpage=8;
$page_count=ceil(count($arr)/$perpage);


for($k = 1 ;$k<= $page_count ; $k++){

    $sqldata ="";
    for($i = ($k-1)*$perpage; $i <=  $k*$perpage-1; $i++){
        if($i<count($arr)) {
            $sqldata .= ($i==0?$arr[$i]:"\r\n\t来佛三圣永思集\t".$arr[$i]);
        }
    }
    $file = $sqldata;

    $articleId= 596 + $k;

$title = '来佛三圣永思集-第'.$k.'页(22页)';
$fields = array('info');
$table = 'uk_article';
$result = loadTxtDataIntoDatabase($articleId,$title,$file,$k,$table,$conn,$fields);
if (array_shift($result)){
  echo 'Success!<br/>';
}else {
  echo 'Failed!--Error:'.array_shift($result).'<br/>';
}


    }





function loadTxtDataIntoDatabase($articleId,$title,$file,$i,$table,$conn,$fields=array(),$insertType='INSERT'){
  if(empty($fields)) {$head = "{$insertType} INTO `{$table}` VALUES('";}
  else {
      $head = "{$insertType} INTO `{$table}`(`id`,`cname`, `ifextend`, `uid`, `places`, `title`, `create_time`, `update_time`, `orders`, `status`, `hits`, `source`, `description`, `cover`, `keywords`, `color`, `content`) VALUES
      ( '".$articleId."', 'lfssysj', 0, 1, '', '".$title."',  '0',  '0', '".$i."', 1, 0, '', '', 0, '".$title."', ''";
  }  //数据头

    $sqldata = trim($file);
    $sqldata = str_replace("'","\'",$sqldata);
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