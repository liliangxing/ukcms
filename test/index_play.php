<?php
session_start();
if (empty($page)) {$page=1;}
if (isset($_GET['page'])==TRUE) {$page=$_GET['page']; }
if (empty($pageSize)) {$pageSize=100;}
if (isset($_GET['pageSize'])==TRUE) {$pageSize=$_GET['pageSize']; }
set_time_limit(0);//让程序一直执行下去
$datas = json_decode(file_get_contents("video_data.txt"),true);
$jsonArry = json_decode(file_get_contents("./upload/json_data.txt"));
foreach($jsonArry  as $key => $jsonData){
    $jsonArry[$key]->url =  "http://www.time24.cn/test/index_douyin.php?video=".urlencode($jsonData->artist)."&title=".
        urlencode($jsonData->title)."&cover_path=".urlencode($jsonData->coverPath)."&from=timeline";
}
$ruleArry = json_encode(array_slice($jsonArry, ($page-1)*$pageSize,$pageSize),true);
$ruleArry = escapeJsonString($ruleArry);
$video=$datas['video'] ;
$title=$datas['title'] ;
$cover_path=$datas['cover_path'] ;
if (isset($_GET['video'])==TRUE) {$video=urldecode($_GET['video']); }
$get_title =  null;
if (isset($_GET['title'])==TRUE) {
    $get_title =  urldecode($_GET['title']);
    $title="[".$title."]".$get_title; }
if (isset($_GET['cover_path'])==TRUE) {$cover_path=urldecode($_GET['cover_path']);}

function escapeJsonString($value) {
	$escapers = array("\\", "/", "\"", "'","\n", "\r", "\t", "\x08", "\x0c");
	$replacements = array("\\\\", "\\/", "\\\"","\'", "\\n", "\\r", "\\t", "\\f", "\\b");
	$result = str_replace($escapers, $replacements, $value);
	return $result;
}
?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=10.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="stylesheet" type="text/css" href="/public/static/home/defaults/css/pages.css">
    <link href="/public/static/home/defaults/css/news.css" rel="stylesheet" type="text/css" />
    <link href="/public/static/home/defaults/css/content.css" rel="stylesheet" type="text/css" />
    <script type="text/javascript" src="/public/static/home/defaults/projekktor/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/public/static/home/defaults/beizhi/content_common.js"></script>
    <title><?php echo $title;?></title>
    <style>
        #content_end  img{
           width: 40%;
        }
    </style>
</head>
<body id="news">
<div class="cover" <?php if (isset($_GET['from'])==TRUE ||!((isset($_GET['cover_path'])==TRUE)
     && $_GET['cover_path']!='' )){echo "style=\"display: none\"";}?>>
    <div><img width="100%" src="<?php echo $cover_path;?>" /></div>
    <div class="text_down"><?php echo $get_title;?></div>
</div>
<div class="Listpage">
<link href="/public/static/home/defaults/projekktor/projekktor.style.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="/public/static/home/defaults/projekktor/projekktor-1.3.09.autoplay.js"></script>
    <video id="player_a" class="projekktor" poster="<?php echo $cover_path;?>"
       title="<?php echo $title;?> " style="width:100%;height:44em" controls>
</video>
<script type="text/javascript">
    //一开始在网上找的，后来加了点自己的进去
    function transSpecialChar(pageStr) {
        if (pageStr != undefined && pageStr != "" && pageStr != 'null') {
           /* pageStr = pageStr.replace(/\r/g, "\\r");
            pageStr = pageStr.replace(/\n/g, "\\n");
            pageStr = pageStr.replace(/\t/g, "\\t");
            pageStr = pageStr.replace(/\\/g, "\\\\");
            //pageStr = pageStr.replace(/\"/g,"&quot;");

            pageStr = pageStr.replace(/"\[{/g, "[{");
            pageStr = pageStr.replace(/}]"/g, "}]");
            // pageStr = pageStr.replace(/("")+/g, '"');
            pageStr = pageStr.replace(/"{"/g, "{\"");
            pageStr = pageStr.replace(/"}"/g, "\"}");
            pageStr = pageStr.replace(/}}"/g, "}}");
            pageStr = pageStr.replace(/\'/g, "&#39;");
            pageStr = pageStr.replace(/ /g, "&nbsp;");
            pageStr = pageStr.replace(/</g, "$lt;");
            pageStr = pageStr.replace(/>/g, "$gt;");*/

            if (pageStr.indexOf("\"") != -1) {
               // pageStr = pageStr.replace(new RegExp('(["\"])', 'g'), "\\\"");
            } else if (pageStr.indexOf("\\") != -1){
                pageStr = pageStr.replace(new RegExp("([\\\\])", 'g'), "\\\\");
             }
        }
        return pageStr;
    }
    var video_first= "<?php echo $video;?>";
    function getJsonData() {
        var jsonStr= '<?php echo $ruleArry;?>';
        var jsonObj =  JSON.parse(jsonStr);
        for(var i =0;i<jsonObj.length;i++){
            var res = jsonObj[i];
            $("#content_end").append("<a href='"+res.url+"' rel=\"noreferrer\" target='_blank'>" +
                "<img src='"+res.coverPath+"'/></a>" +
                "<p style='text-decoration: underline; margin: 0.6em 0  1.4em 0;'><a href='"+res.artist+"' rel=\"noreferrer\" target='_blank'>" +
                ""+res.title+"</a> " +
                "<a href='"+res.fileName+"'  target='_blank'>"+res.fileName+"</a> </p>");
        }
    }
    function getApi() {
        //设置时间 5-秒  1000-毫秒  这里设置你自己想要的时间
        setTimeout(getApi, 1 * 1000);
        $.ajax({
            url: "http://www.time24.cn/test/index_push.php",
            type: "GET",
            data: {
            },
            dataType : 'json',
            success: function (res) {
               if(video_first != res.video)
               {
                   $("#content_end").prepend("<p><a href='"+res.video+"' rel=\"noreferrer\" target='_blank'>" +
                       "<img src='"+res.cover_path+"' /></a>" +
                       ""+res.title+"<a href='"+res.from+"' rel=\"noreferrer\" target='_blank'> "+res.from+"</a></p>");
                   video_first = res.video;
               }
            }
        });
    }
    $(document).ready(function () {
        getApi();
        getJsonData();
        projekktor('#player_a', {
            autoplay: true,
            loop:true,
            playlist : [
                {0:{src:'<?php echo $video;?>', type: 'video/mp4'}}
            ]

        });
    });
</script>

  <div class="page-bizinfo">
     <div class="text_down" ><?php echo $get_title;?></div>
     <div class="text_down" style="word-wrap: break-word">下载地址：<br/>
        <a href="<?php echo $video;?>" rel="noreferrer" target="_blank"><?php echo $video;?> </a> <br/>(请用在新的浏览器打开下载)
     </div>
    <div id="content_end">
    </div>
      <div class="showPages">
          <div class="pages"><a class="ui button" href="?page=<?php echo $page+1;?>&pageSize=<?php echo $pageSize;?>">下一页</a></div>
      </div>
  </div>
</div>
</body>
</html>
