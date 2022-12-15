function search1() {
    if (document.getElementById("txtsearch1").value == "") {
        alert("请输入搜索条件！")
    }
    else {
        $('[name="condition"]').val("q="+document.getElementById("txtsearch1").value);
        $('#search').submit();
    }
}
function loadPage(value){
    location.href=value;
};

function gotoPage(){
    var url=$('#z').val();
    location.href=url;
};

$(window).scroll(function () {
    var sc = $(window).scrollTop();
    if (sc > $(window).height() / 2 || sc>100 || $(window).height()> 600) {
        $(".showPages").css("display", "block");
    } else {
        $(".showPages").css("display", "none");
    }
});
$(document).keydown(function(e){
    var e = e || event,
        keycode = e.which || e.keyCode;
    if (keycode==13) {
        $(".search_btn").trigger("click");
    }
});

$(function(){
  if($(window).height()> 600){
      $(".showPages").css("display", "block");
  }
});