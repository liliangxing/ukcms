<?php
uploadFile();
function uploadFile()
{
    if (!$_FILES['file']['tmp_name'] || !$_FILES['file']['name']) {
        echo "<script>alert('请选择要上传的文件！');history.go(-1);location.reload();</script>";
        exit();
    }
    $fileName = basename($_FILES['file']['name']);
    $tempName = $_FILES['file']['tmp_name'];

    $date = "upload";
    $dir = "./" . $date;
    chmod($dir, 0777);  //修改文件权限
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);//创建多级目录
//echo "<script type='text/javascript'>alert('请在有效的时间内执行修改操作！');history.go(-1);location.reload();</script>";
//exit();
    }
    $newFile = $dir . "/" . $fileName;
    if (is_file($newFile)){
        rename($newFile, dirname($newFile) . DIRECTORY_SEPARATOR . time() . '-' . basename($newFile));
    }
    if (is_uploaded_file($_FILES['file']['tmp_name'])) {
        $res = move_uploaded_file($_FILES['file']['tmp_name'], iconv("gb2312", "UTF-8", $newFile));
        if (!$res) {
            echo "fail";
        } else {
            echo "success";
        }
    }

}
