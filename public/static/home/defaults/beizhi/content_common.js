function setCookie(name, value)		//cookies设置
{
    var argv = setCookie.arguments;
    var argc = setCookie.arguments.length;
    var expires = (argc > 2) ? argv[2] : null;
    if(expires!=null)
    {
        var LargeExpDate = new Date ();
        LargeExpDate.setTime(LargeExpDate.getTime() + (expires*1000*3600*24));
    }
    document.cookie = name + "=" + escape (value)+((expires == null) ? "" : ("; expires=" +LargeExpDate.toGMTString()));
}

function getCookie(Name)			//cookies读取
{
    var search = Name + "="
    if(document.cookie.length > 0)
    {
        var offset = document.cookie.indexOf(search);
        if(offset != -1)
        {
            offset += search.length;
            var end = document.cookie.indexOf(";", offset);
            if(end == -1) end = document.cookie.length;
            return unescape(document.cookie.substring(offset, end))
        }
        else return ""
    }
}

function changeURLArg(url, arg, arg_val) {
    /// <summary>
    /// url参数替换值
    /// </summary>
    /// <param name="url">目标url </param>
    /// <param name="arg">需要替换的参数名称</param>
    ///<param name="arg_val">替换后的参数的值</param>
    /// <returns>参数替换后的url </returns>
    var pattern = arg + '=([^&]*)';
    var replaceText = arg + '=' + arg_val;
    if (url.match(pattern)) {
        var tmp = '/(' + arg + '=)([^&]*)/gi';
        tmp = url.replace(eval(tmp), replaceText);
        return tmp;
    } else {
        if (url.match('[\?]')) {
            return url + '&' + replaceText;
        } else {
            return url + '?' + replaceText;
        }
    }
    return url + '\n' + arg + '\n' + arg_val;
}
