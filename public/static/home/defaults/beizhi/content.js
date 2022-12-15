var scrollFlag = true;
var canScrollFlag = false;
window.onload = function () {
    var oWin = document.getElementById("win");
    var oLay = document.getElementById("overlay");
    var oBtn = document.getElementById("popmenu");
    var oClose = document.getElementById("close");
    var right_nav = document.getElementById("right_nav");
    var right_nav_click = document.getElementById("right_nav_click");
    right_nav_click.onclick = function () {
        right_nav.style.display = "block";
        right_nav_click.style.display = "none"
    };
    oBtn.onclick = function () {
        oLay.style.display = "block";
        oWin.style.display = "block"
    };
    oLay.onclick = function () {
        oLay.style.display = "none";
        oWin.style.display = "none"
    }
};

$(function(){
    /*$('#gotoVideo').on('click',function(){
        var sc = $(this).attr("data-id");
        var gotoVideo_value=getCookie("gotoVideo"+sc);
        var url = changeURLArg(location.href.replace(new RegExp("(\\?|&)playSound=([^&]*)(&|$)"),''), "playVideo", "1");
        if(gotoVideo_value!="1") {
            if (confirm('您可以在开启wifi的环境下，打开收看')) {
                setCookie("gotoVideo" + sc, 1, 70);
                location.href = url;
            }
        }else{
            location.href = url;
        }
    });*/

    var cnanme = $("#content").attr("data-id");
    switch (cnanme) {
        case "lfssysj":
            $("#content").prepend("<p align='center'><img src='http://www.time24.cn/public/uploads/images/20200107/c87169c995c6d6dacd62b79dba7af90e.jpg'/></p>");
            break;
        case "jtsxlbhw":
            doximalaya();
            break;
        case "jtsxlwyw":
            doximalaya();
            break;
        case "wjxjzy":
            doguanghua();
            break;
        case "bet":
            dobet();
            break;
        case "smlyyl":
            dosmlyyl();
            break;
    }
    function dosmlyyl(){
        $("#content").prepend("<p>来源：<br><a href='http://www.amtb.org.tw/bt/amtb_jindian.asp?web_choice=26&web_amtb_index=266' target='_blank'>http://www.amtb.org.tw/bt/amtb_jindian.asp?web_choice=26&web_amtb_index=266</a></p>");
    }
    function dobet(){
        $("#content").prepend("<p>来源：<br><a href='http://www.amtb.org.tw/rsd/jiangtang_ch.asp?web_choice=99&web_rel_index=3970' target='_blank'>http://www.amtb.org.tw/rsd/jiangtang_ch.asp?web_choice=99&web_rel_index=3970</a></p>");
    }
    function doguanghua(){
        $("#content_end").css("font-size","0.8em");
        $("#content_end").append("<p><a href='http://www.amtb.org.tw/pdf/HZ13-08-01.pdf' target='_blank'>《五戒相经笺要集注》广化老法师 注 pdf文件下载 </a></p>");
    }
    function doximalaya(){
        $("#content").prepend("<p><a href='https://m.ximalaya.com/share/album/29460242' target='_blank'>净土圣贤录白话 音频（645集）</a></p>");
    }
    if(getUrlParam("playVideo")!=1){
        $(".pre_next_box div").show();
        $(".pre_next_box").css("margin","0.7rem 0 0.7rem 0");
    }
    $("#goTop,#backTop").click(function () {
        $("#nav_wrap_bg").hide();
        $("#nav_wrap").hide();
        scrollFlag = false;
        canScrollFlag = false;
        if($("#search_close").is(":visible")){
            doClose();
        }
        $('body,html').animate({scrollTop: 0}, 100);
        setTimeout(function () {
            canScrollFlag = true;
        }, 200);
    });
    $("#content img").click(function(){
        var imgArray = [];
        var curImageSrc = canonical_uri($(this).attr('src'), window.location.host +"/");
        console.log(curImageSrc);
        var oParent = $(this).parent();
        if (curImageSrc && !oParent.attr('href')) {
            $('#content img').each(function(index, el) {
                var itemSrc = canonical_uri($(this).attr('src'),window.location.host +"/");
                imgArray.push(itemSrc);
            });
            wx.previewImage({
                current: curImageSrc,
                urls: imgArray
            });
        }
    });

    $('.font_size_click').on('click',function(){
        var data_id = $(this).attr("data-id");
        $("#content p").css("font-size", data_id+"em");
        $(this).siblings().css("text-decoration","underline");
        $(this).css("text-decoration","");
        var i;
        if(data_id=="1.1875"){
            i="0";
        }else if(data_id=="1.125"){
            i="1";
        }else {
            i="2";
        }
        setCookie(font_size_setting,i,15);
    });
    $('#search_btn').click(highlight);//点击search时，执行highlight函数；
    $('#search_close').click(function (e) {
        clearSelection();//先清空一下上次高亮显示的内容；
        doClose();

    });
    $('#searchstr').keydown(function (e) {
        var key = e.which;
        if (key == 13) highlight();
    });

    $(".ui-btn-left_pre").click(function(){
        var   backUrl= $(this).attr('data-url');
        if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){ // IE
            if(history.length > 0){
                window.history.go( -1 );
            }else{
                window.location.href =backUrl;
            }
        }else{ //非IE浏览器
            if (navigator.userAgent.indexOf('Firefox') >= 0 ||
                navigator.userAgent.indexOf('Opera') >= 0 ||
                navigator.userAgent.indexOf('Safari') >= 0 ||
                navigator.userAgent.indexOf('Chrome') >= 0 ||
                navigator.userAgent.indexOf('WebKit') >= 0){
                if(window.history.length > 1){
                    window.history.go( -1 );
                }else{
                    window.location.href =backUrl;
                }
            }else{ //未知的浏览器
                window.history.go( -1 );
            }
        }
    });

    if(window.itcast) {
        $("#mediaPlay").show();
    }
    $("#mediaPlay").click(function () {
        if(window.itcast) {
            window.itcast.showToast($(this).attr("data-id"));
        }else {
            if (confirm('您可以下载大经科注app，体验一下')) {
                location.href = "http://www.time24.cn/html/download.html";
            }
        }
    });

    $( 'body' ).append( tipsDiv );
});

var i = 0;
var sCurText;
function highlight(){
    clearSelection();//先清空一下上次高亮显示的内容；
    var flag = 0;
    var bStart = true;
    $('#tip').text('');
    $('#tip').hide();
    var searchText = $('#searchstr').val();
    var _searchTop = $('#searchstr').offset().top+30;
    var _searchLeft = $('#searchstr').offset().left;
    if($.trim(searchText)==""){
        //alert(123);
        showTips("请输入查找内容",_searchTop,3,_searchLeft);
        return;
    }
    var searchText = $('#searchstr').val();//获取你输入的关键字；
    var regExp = new RegExp(searchText, 'g');//创建正则表达式，g表示全局的，如果不用g，则查找到第一个就不会继续向下查找了；
    var content = $("#content").text();
    if (!regExp.test(content)) {
        showTips("没有找到要查找的内容",_searchTop,3,_searchLeft);
        return;
    } else {
        if (sCurText != searchText) {
            i = 0;
            sCurText = searchText;
        }
    }
    $('#content p,#content div').each(function(){
        var html = $(this).html();
        var newHtml = html.replace(regExp, '<span class="highlight">'+searchText+'</span>');//将找到的关键字替换，加上highlight属性；
        $(this).html(newHtml);//更新；
        flag = 1;
    });
    if (flag == 1) {
        if ($(".highlight").length> 1) {
            var _top = $(".highlight").eq(i).offset().top+$(".highlight").eq(i).height();

            var _left = $(".highlight").eq(i).offset().left;
            $("#search_close").html("×");
            $("#tip").show();
            $("#tip").offset({ top: _top, left: _left });
            $("#search_btn").val("下一个 "+(i+1)+"/"+$(".highlight").length+"");
            $("#search_btn").css("position","fixed");
            $("#search_btn").css("top","0.3rem");
            $("#search_btn").css("right", (($(window).width()-$("body").width())/2+40) + "px");
            $("#search_btn").css("z-index","3");
            $(".highlight").eq(i).css("backgroundColor","#ff9632");
            $(".highlight").eq(i).css("color","#000000");
        }else{
            $("#search_close").html("");
            $(".highlight").css("backgroundColor","#ffffff");
            $(".highlight").css("color","#ff9632");
            var _top = $(".highlight").offset().top+$(".highlight").height();
            var _left = $(".highlight").offset().left;
            $('#tip').show();
            $("#tip").offset({ top: _top, left: _left });
        }
        $("#search_close").css("right", (($(window).width()-$("body").width())/2+5) + "px");
        $("#search_close").show();
        var _tWidth =  $(".highlight").eq(i).width();
        $("#tip").css("width",_tWidth);
        $("html, body").animate({ scrollTop: _top - 92 });
        i++;
        if (i > $(".highlight").length - 1) {
            i = 0;
        }
    }
}

function clearSelection(){
    $('#content p,#content div').each(function(){
        //找到所有highlight属性的元素；
        $(this).find('.highlight').each(function(){
            $(this).replaceWith($(this).html());//将他们的属性去掉；
        });
    });
}

//mask
var tipsDiv = '<div class="tipsClass"></div>';
function showTips( tips, height, time,left ){
    var windowWidth = document.documentElement.clientWidth;
    $('.tipsClass').text(tips);
    $( 'div.tipsClass' ).css({
        'top' : height + 'px',
        'left' :left + 'px',
        'position' : 'absolute',
        'padding' : '8px 6px',
        'background': '#000000',
        'font-size' : 14 + 'px',
        'font-weight': 900,
        'margin' : '0 auto',
        'text-align': 'center',
        'width' : 'auto',
        'z-index':'4',
        'color' : '#fff',
        'border-radius':'2px',
        'opacity' : '0.8' ,
        'box-shadow':'0px 0px 10px #000',
        '-moz-box-shadow':'0px 0px 10px #000',
        '-webkit-box-shadow':'0px 0px 10px #000'
    }).show();
    setTimeout( function(){$( 'div.tipsClass' ).fadeOut();}, ( time * 1000 ) );
}
var font_size_setting="font_size"+self.location.hostname.toString().replace(/\./g,"");
var font_size=getCookie(font_size_setting);
function canonical_uri(src, base_path)
{
    var root_page = /^[^?#]*\//.exec(location.href)[0],
        root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
        absolute_regex = /^\w+\:\/\//;
    // is `src` is protocol-relative (begins with // or ///), prepend protocol
    if (/^\/\/\/?/.test(src))
    {
        src = location.protocol + src;
    }
    // is `src` page-relative? (not an absolute URL, and not a domain-relative path, beginning with /)
    else if (!absolute_regex.test(src) && src.charAt(0) != "/")
    {
        // prepend `base_path`, if any
        src = (base_path || "") + src;
    }
    // make sure to return `src` as absolute
    return absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain : root_page) + src);
}


function overrrideUrl(pageIndex) {

    var url = window.location.href;
    var   newUrl=  changeURLArg(url, "p", pageIndex);
    window.history.pushState({}, "", newUrl);
}
//获取url中的参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}

function scrollToKeyword() {
    window.location.href =  changeURLArg(window.location.href, "act", "scrollTo");
}

function doClose(){
    $('#search_close').hide();
    $("#search_btn").val("页内查找");
    $("#search_btn").css("position","static");
}