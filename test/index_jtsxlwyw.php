<?php
session_start();
if (empty($page)) {$page=1;}
if (isset($_GET['page'])==TRUE) {$page=$_GET['page']; }
?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Read Result</title>
    <style type="text/css">
        <!--
        .STYLE1 {font-size: 12px}
        .STYLE2 {font-size: 18px}
        -->
    </style>
</head>
<body>
<table width="100%"  bgcolor="#CCCCCC">
    <tr>
        <td >
            <?php
            if($page){
                $counter=file_get_contents("txt/jtsxlwyw/liujiao2004.txt"); //读取txt文件内容到$counter
                $counter = iconv("GBK", "UTF-8", $counter);
                $length=mb_strlen($counter,"UTF-8");
                $pageLength = 6600;
                $page_count=ceil($length/$pageLength);

//------------截取中文字符串---------
                $c=mb_substr($counter,0,($page-1)*$pageLength);
                $c1=mb_substr($counter,0,$page*$pageLength);
                $sqldata = mb_substr($c1,mb_strlen($c),mb_strlen($c1)-mb_strlen($c));
                $sqldata = str_replace("\r\n\r\n\r\n","\r\n\r",$sqldata);
                $sqldata = str_replace("\r\n\r\n","<br/><br/>",$sqldata);
                $sqldata = str_replace("\r\n","<br/>",$sqldata);
                $sqldata = str_replace("●●","<br/>　　",$sqldata);
                $sqldata = str_replace("　　 ","　　",$sqldata);
                echo $sqldata;
            }?>
        </td>
    </tr>
</table>
<table width="100%"  bgcolor="#cccccc">
    <tr>
        <td width="42%" align="center" valign="middle"><span class="STYLE1"> <?php echo $page;?> / <?php echo $page_count;?> 页 </span></td>
        <td width="58%" height="28" align="left" valign="middle">
<span class="STYLE1">
<?php
echo "<a href=?page=1>首页</a> ";
if($page!=1){
    echo "<a href=?page=".($page-1).">上一页</a> ";
}
if($page<$page_count){
    echo "<a href=?page=".($page+1).">下一页</a> ";
}
echo "<a href=?page=".$page_count.">尾页</a>";
?>
</span> </td>
    </tr>
</table>
</body>
</html>