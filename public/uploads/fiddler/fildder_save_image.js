static function OnDone(oSession: Session) {
	FiddlerObject.log(oSession)
	//判断host请求避免下载非小恩爱的相册图片
	if(oSession.RequestHeaders["Host"].Contains(":85")){
		//检查Content-Type
		if (oSession.ResponseHeaders["Content-Type"]!=null || oSession.ResponseHeaders["content-type"]!=null)
		{
			//避免不规范标头
			var contentType=oSession.ResponseHeaders["Content-Type"];
			if (String.IsNullOrEmpty(contentType) )
				contentType=oSession.ResponseHeaders["content-type"];

			//判定请求是否图片
			if (contentType.Contains("image"))
			{
				//确定文件名（保存用）
				var fileName="";
				var fileIndex =    oSession.RequestHeaders.RequestPath.LastIndexOf ("/");
				if (fileIndex>0)
					fileName =    oSession.RequestHeaders.RequestPath.Substring (fileIndex+1);

				//如果文件名非法（名称含非法字符）
				if(fileName.IndexOf('?')>0 || fileName.IndexOf('&') )
					fileName=String.Empty;
				//输出日志（在Fiddler 主窗口，日志处输出）
				//FiddlerObject.log("Content-Type:"+ contentType +" RequestPath:"+oSession.RequestHeaders.RequestPath);

				//如果文件名为Null,自行创建一个文件名（Guid）
				if (String.IsNullOrEmpty( fileName))
				{
					fileName=Guid.NewGuid().ToString();
					var extName=    contentType.Replace("image/","");
					fileName=fileName+"."+extName;
				}

				//太小的图片不要，比如站位图片（自行调节）
				if (oSession.ResponseBody.Length>100)
				{
					//指定保存位置
					var saveDir="d:\\Temp\\";
					//不存在则创建文件夹
					if (!System.IO.Directory.Exists(saveDir))
						System.IO.Directory.CreateDirectory(saveDir);

					//保存响应流
					oSession.SaveResponseBody(saveDir+fileName);
					//写日志
					FiddlerObject.log("[文件保存]:"+fileName)
				}
			}
		}
	}

}