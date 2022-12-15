<?php

namespace app\home\controller;

use think\Controller;
use think\Db;
use weixin\Wechat;

class Weixin extends Controller {
    private $token;
    private $data = array();

    public $thisWxUser;

    /**
     * 应用程序初始化
     * @access public
     * @return void
     */
    static public function init()
    {
        // 定义当前请求的系统常量
        define('NOW_TIME',      $_SERVER['REQUEST_TIME']);
        define('REQUEST_METHOD',$_SERVER['REQUEST_METHOD']);
        define('IS_GET',        REQUEST_METHOD =='GET' ? true : false);
        define('IS_POST',       REQUEST_METHOD =='POST' ? true : false);
    }
    public function _initialize()
    {
        $this->token = $_GET['token'];

    }

    public function index($name = '')
    {
        switch ($name) {
            case "index":
                return $this->home();
                break;
            case "diymen":
                return $this->diymen();
                break;
            default://频道
                return $this->home();
                break;
        }

    }

    public function home()
    {
        Weixin::init();
        if (!class_exists('SimpleXMLElement')) {
            die('SimpleXMLElement class not exist');
        }
        if (!function_exists('dom_import_simplexml')) {
            die('dom_import_simplexml function not exist');
        }
        $this->token = $_GET['token'];
        if (!preg_match('/^[0-9a-zA-Z]{3,42}$/', $this->token)) {
            die('error token');
        }
        $weixin = new Wechat($this->token);
        $data = $weixin->request();
        $this->data = $weixin->request();
        if ($this->data) {
           // Db::name('wxuser')->where('id', 1)->update(['tongji' => var_export($data,true)]);
            list($content, $type) = $this->reply($data);
            $weixin->response($content, $type);
            return;
        }
    }

    private function reply($data)
    {
        //判断关注
        if (isset($data['Event'])) {
            if ('CLICK' == $data['Event']) {
                $data['Content'] = $data['EventKey'];
                $this->data['Content'] = $data['EventKey'];
            }
        }
        if(isset($data['Content'])){
            $key = $data['Content'];
            return $this->keyword($key);
        }
    }

    private function keyword($key)
    {
        $key = trim($key);
        $like['token'] = $this->token;

        $back = Db::name('img')->field('id,text,pic,url,title')->limit(9)->order('usort desc,id DESC')
            ->where('keyword', 'like', '%' . $key . '%')
            ->where('pic', 'neq', '')
            ->where($like)
            ->select();
        if ($back == false) {
            return array( '阿弥陀佛', 'text');
        }
        foreach ($back as $keya => $infot) {

            $return[] = array($infot['title'], $this->handleIntro($infot['text']), $infot['pic'], $infot['url']);
        }

        return array($return, 'news');



    }

    public function handleIntro($str)
    {
        $str = html_entity_decode(htmlspecialchars_decode($str));
        $search = array('&amp;', '&quot;', '&nbsp;', '&gt;', '&lt;');
        $replace = array('&', '"', ' ', '>', '<');
        return strip_tags(str_replace($search, $replace, $str));
    }

    public function diymen()
    {
        Weixin::_initialize();
        session('token',  $this->token);
        $this->thisWxUser['appid']="wxbeaf750645a256f4";
        $this->thisWxUser['appsecret']="6c5172cd7d74b48366cd1bf2e5acb233";
        $url_get='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$this->thisWxUser['appid'].'&secret='.$this->thisWxUser['appsecret'];
        $json=json_decode($this->curlGet($url_get));
        if (!$json->errmsg){
            //return array('rt'=>true,'errorno'=>0);
        }else {
            $this->error('获取access_token发生错误：错误代码'.$json->errcode.',微信返回错误信息：'.$json->errmsg);
        }

        $data = '{"button":[';

        $class= Db::name('diymen_class')->where(array('token'=>session('token'),'pid'=>0,'is_show'=>1))->limit(3)->order('sort desc')->select();//dump($class);
        $kcount=Db::name('diymen_class')->where(array('token'=>session('token'),'pid'=>0,'is_show'=>1))->limit(3)->order('sort desc')->count();
        $k=1;
        foreach($class as $key=>$vo){
            //主菜单

            $data.='{"name":"'.$vo['title'].'",';
            $c=Db::name('diymen_class')->where(array('token'=>session('token'),'pid'=>$vo['id'],'is_show'=>1))->limit(5)->order('sort desc')->select();
            $count=Db::name('diymen_class')->where(array('token'=>session('token'),'pid'=>$vo['id'],'is_show'=>1))->limit(5)->order('sort desc')->count();
            //子菜单
            $vo['url']=str_replace(array('&amp;'),array('&'),$vo['url']);
            if($c!=false){
                $data.='"sub_button":[';
            }else{
                if(!$vo['url']){
                    $data.='"type":"click","key":"'.$vo['keyword'].'"';
                }else {
                    $data.='"type":"view","url":"'.$vo['url'].'"';
                }
            }
            $i=1;
            foreach($c as $voo){
                $voo['url']=str_replace(array('&amp;'),array('&'),$voo['url']);
                if($i==$count){
                    if($voo['url']){
                        $data.='{"type":"view","name":"'.$voo['title'].'","url":"'.$voo['url'].'"}';
                    }else{
                        $data.='{"type":"click","name":"'.$voo['title'].'","key":"'.$voo['keyword'].'"}';
                    }
                }else{
                    if($voo['url']){
                        $data.='{"type":"view","name":"'.$voo['title'].'","url":"'.$voo['url'].'"},';
                    }else{
                        $data.='{"type":"click","name":"'.$voo['title'].'","key":"'.$voo['keyword'].'"},';
                    }
                }
                $i++;
            }
            if($c!=false){
                $data.=']';
            }

            if($k==$kcount){
                $data.='}';
            }else{
                $data.='},';
            }
            $k++;
        }
        $data.=']}';

        file_get_contents('https://api.weixin.qq.com/cgi-bin/menu/delete?access_token='.$json->access_token);

        $url='https://api.weixin.qq.com/cgi-bin/menu/create?access_token='.$json->access_token;
        var_dump($data);
        $rt=$this->api_notice_increment($url,$data);
        if($rt['rt']==false){
            $this->error('操作失败,curl_error:'.$rt['errorno']);
        }else{
            $this->success('操作成功');
        }
        exit;
    }

    function api_notice_increment($url, $data){
        $ch = curl_init();
        $header["Accept-Charset"]= "utf-8";
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)');
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $tmpInfo = curl_exec($ch);
        $errorno=curl_errno($ch);
        if ($errorno) {
            return array('rt'=>false,'errorno'=>$errorno);
        }else{
            $js=json_decode($tmpInfo,1);
            if ($js['errcode']=='0'){
                return array('rt'=>true,'errorno'=>0);
            }else {
                $this->error('发生错误：错误代码'.$js['errcode'].',微信返回错误信息：'.$js['errmsg']);
            }
        }
    }
    function curlGet($url){
        $ch = curl_init();
        $header["Accept-Charset"]= "utf-8";
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 5.01; Windows NT 5.0)');
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_AUTOREFERER, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $temp = curl_exec($ch);
        return $temp;
    }


}
