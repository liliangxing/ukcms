<?php
$dir = dirname(__FILE__);
$open_dir = opendir($dir);
echo "<table border=1 borderColor=red cellpadding=6 width='600' style='margin-top: 100px;' align='center'>";
echo "<tr><th>文件名</th><th>大小</th><th>类型</th><th>修改日期</th></tr>";
while ($file = readdir($open_dir)) {
    if ($file!= "." && $file != "..") {
        $strFile = substr($file,-3);
        if($strFile == 'mp4') {
            echo "<tr><td><a target='_blank' href='".$file."'>".$file."</a></td>";
        }else {
            echo "<tr><td>" . $file . "</td>";
        }
        echo "<td>" .format_bytes(filesize($file)) ." </td>";
        echo "<td>" . mime_content_type($file) . "</td>";
        echo "<td>" . date("Y-m-d H:i:s",filemtime($file)) . "</td></tr>";
    }
}
echo "</table>";

/**
 * 格式化字节大小
 * @param  number $size      字节数
 * @param  string $delimiter 数字和单位分隔符
 * @return string            格式化后的带单位的大小
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
function format_bytes($size, $delimiter = '') {
    $units = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
    for ($i = 0; $size >= 1024 && $i < 5; $i++)
        $size /= 1024;
    return round($size, 2) . $delimiter . $units[$i];
}