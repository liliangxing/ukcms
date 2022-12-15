<?php

namespace app\home\controller;

use think\Db;
use str\FanJianConvert;
use think\facade\Cache;

class Column extends Common {

    public function index($name = '', $condition = '') {
        $result = $this->validate(['columnName' => $name], ['columnName|栏目标识' => 'require|alpha']);
        if (true !== $result) {
            abort(404, $result);
        }
        $Column = model('Column');
        try {
            $columnInfo = $Column->getColumnInfo($name);
        } catch (\Exception $ex) {
            abort(404, $ex->getMessage());
        }
        $ModelField = model('ModelField');
        if (2 == $columnInfo['type'] && $columnInfo['model_id']) {
            //获取内容模型信息
            $modelInfo = $ModelField->getModelInfo($columnInfo['model_id'], 'id,title,table,ifsub');
        }
        if ($this->request->isPost()) {
            if (!isset($modelInfo)) {
                $this->error('栏目禁止投稿~');
            }
            if (!$modelInfo['ifsub']) {
                $this->error($modelInfo['title'] . '模型禁止投稿~');
            }
            $data = $this->request->post();
            // 验证码
            if (config('captcha_signin_model')) {
                $captcha = $data['captcha'];
                $captcha == '' && $this->error('请输入验证码');
                if (!captcha_check($captcha)) {
                    //验证失败
                    $this->error('验证码错误或失效');
                }
            }
            //令牌验证
            $vresult = $this->validate($data, ['__token__|令牌' => 'require|token']);
            if (true !== $vresult) {
                $this->error($vresult);
            }
            $data['modelField']['cname'] = $name;
            $data['modelField']['orders'] = 100;
            $data['modelField']['status'] = 0;

            $data['modelFieldExt'] = isset($data['modelFieldExt']) ? $data['modelFieldExt'] : [];
            try {
                $ModelField->addModelData($modelInfo['id'], $data['modelField'], $data['modelFieldExt']);
            } catch (\Exception $ex) {
                $this->error($ex->getMessage());
            }
            $this->success($modelInfo['title'] . '提交成功~');
        } else {
            //拓展字段
            if ($columnInfo['ext_model_id']) {
                $extInfo = $ModelField->getModelInfo($columnInfo['ext_model_id'], 'id,title,table,ifsub');
                $data = model('ModelField')->getDataInfo($extInfo['table'], "cname='" . $columnInfo['name'] . "' and status='1'", '*', '*');
                //更新点击量
                Db::name($extInfo['table'])->where('id', $data['id'])->inc('hits')->update();
                $this->assign('infoext', $data);
            }
            //列表栏目
            if (isset($modelInfo)) {
                if ($modelInfo['ifsub']) {
                    $fieldList = model('ModelField')->getFieldList($modelInfo['id']);
                    $this->assign('fieldList', $fieldList);
                }
                $where = "status='1' and create_time <" . time();

                //条件输出变量
                $conditionParam = [];
                $param = paramdecode($condition);
                $keyword=$param['q'];

                //捕获不到$condition,使用$_GET[]方法
                if(empty($condition)) {
                    $condition=$_GET['condition'];
                    $param2 = paramdecode($condition);
                    $keyword2 = $param2['q'];
                    if (empty($keyword)) {
                        $keyword = $keyword2;
                    }
                }

                //处理栏目列表筛选参数
                $param = [];
                if (isset($columnInfo['condition'])) {
                    $parr = explode(',', $columnInfo['condition']);
                    $pstr = "'" . str_replace(',', "','", $columnInfo['condition']) . "'";
                    $fieldInfo = model('ModelField')->getFieldList($columnInfo['model_id'], null, '', "status='1' and name in($pstr)", 'name,type,options,jsonrule,value,title');

                    foreach ($parr as $vo) {
                        if (!empty($vo)) {
                            //判断是否是单选条件
                            $ifradio = 'checkbox' == $fieldInfo[$vo]['type'] ? false : true;
                            if ($ifradio) {
                                //单选选中参数
                                if (!empty($param[$vo])) {
                                    $conditionParam[$vo]['options'][$param[$vo]]['active'] = true;
                                    $nowParam = $param;
                                    $nowParam[$vo] = '';
                                    $conditionParam[$vo]['options'][$param[$vo]]['param'] = paramencode($nowParam);
                                    unset($nowParam);
                                    //单选条件
                                    $where.=" and $vo='$param[$vo]'";
                                }
                            } else {
                                //多选选中参数
                                if (!empty($param[$vo])) {
                                    $paramContent = explode('_', $param[$vo]);
                                    foreach ($paramContent as $k => $v) {
                                        $nowParamContent = $paramContent;
                                        unset($nowParamContent[$k]);
                                        $nowParam = $param;
                                        $nowParam[$vo] = implode('_', $nowParamContent);
                                        $conditionParam[$vo]['options'][$v]['active'] = 1;
                                        $conditionParam[$vo]['options'][$v]['param'] = paramencode($nowParam);
                                        unset($nowParam);
                                        unset($nowParamContent);
                                        //多选条件
                                        $where.=" and $vo like '%,$v,%'";
                                    }
                                    unset($paramContent);
                                }
                            }
                            //生成完整条件输出变量
                            $conditionParam[$vo]['title'] = $fieldInfo[$vo]['title'];
                            $conditionParam[$vo]['name'] = $vo;
                            foreach ($fieldInfo[$vo]['options'] as $k => $v) {
                                $conditionParam[$vo]['options'][$k]['title'] = $v;
                                //未选中条件参数生成
                                if (!isset($conditionParam[$vo]['options'][$k]['active'])) {
                                    $conditionParam[$vo]['options'][$k]['active'] = 0;
                                    if ($ifradio) {
                                        $nowParam = $param;
                                        $nowParam[$vo] = $k;
                                        $conditionParam[$vo]['options'][$k]['param'] = paramencode($nowParam);
                                    } else {
                                        $nowParam = $param;
                                        $nowParam[$vo] = empty($param[$vo]) ? $k : $param[$vo] . '_' . $k;
                                        $conditionParam[$vo]['options'][$k]['param'] = paramencode($nowParam);
                                    }
                                    unset($nowParam);
                                }
                                $conditionParam[$vo]['options'][$k]['url'] = url('column/index', ['name' => $columnInfo['name'], 'condition' => $conditionParam[$vo]['options'][$k]['param']]);
                                ksort($conditionParam[$vo]['options']);
                            }
                        }
                    }
                    $this->assign('condParam', $conditionParam);
                }
                //处理栏目列表筛选参数结束
                $pageNum = input('param.page');
                $page = [$columnInfo['list_row'], false, [
                        'page' => $pageNum? : 1,
                        'path' => empty($condition) ? $name . '-[PAGE].html' : $name . '-[PAGE].html?condition=' . urlencode($condition) . ''
                ]];
                if ('' != $columnInfo['listorder']) {
                    if (!empty($keyword)) {
                        $columnInfo['listorder'] = 'cname asc,' . $columnInfo['listorder'];
                    }
                    if (strpos($columnInfo['listorder'], 'id ') === false) {
                        $columnInfo['listorder'].=',id desc';
                    }
                } else {
                    $columnInfo['listorder'] = 'orders,addtime desc';
                }
                $where2 = "1=1 ";
                if (!empty($keyword)) {
                    $where2.=" and (locate('$keyword',title)>0 or locate('$keyword',content)>0 )";
                    $fantizi = FanJianConvert::tradition2simple($keyword);
                    $where2 = str_replace($keyword, $fantizi, $where2);
                    $this->assign('fantizi', $keyword);
                    $where = model('ModelField')->joinCnameCondition($where, $columnInfo['id'],$columnInfo['model_id']);
                    $subQuery = Db::name($modelInfo['table'])
                        ->where($where)
                        ->buildSql();
                    $modelInfo['table'] =$subQuery.' a';
                    $where = $where2;
                    $columnInfo['template_list'] =FanJianConvert::$article_list;
                }
                $list = model('ModelField')->getDataList($modelInfo['table'], $where, "*", "", $columnInfo['listorder'], "", $page, $columnInfo['id']);
                if ($list->isEmpty() && 1 != $page[2]['page']) {
                    abort(404, '第' . $page[2]['page'] . '页没有信息~');
                }
                $this->assign('param', $param);
                $this->assign('list', FanJianConvert::addPlaySound($list->toArray()));
                $this->assign('page', $list->render());
            }
            $this->assign([
                'info' => $columnInfo,
                'crumbs' => $Column->getBreadcrumb($columnInfo['path'] . $columnInfo['id']),
                'rootName' => $this->getColumnName($columnInfo['path'] . $columnInfo['id']),
                'parentName' => $this->getColumnName($columnInfo['path'], 'parent'),
            ]);
            return $this->display('column/index/' . $columnInfo['template_list']);
        }
    }

//列表栏目内容
    public function content($name = '', $id = 0) {
        if($_GET[act]=='scrollTo'){
            return $this->scrollTo($name,$id);
        }/*else if($_GET[act]=='add'){
            return $this->add($name);
        }*/
        $result = $this->validate(['columnName' => $name, 'id' => $id], ['columnName|栏目标识' => 'require|alpha', 'id|文档ID' => 'require|number']);
        if (true !== $result) {
            abort(404, $result);
        }
        $Column = model('Column');
        try {
            $columnInfo = model('Column')->getColumnInfo($name);
        } catch (\Exception $ex) {
            abort(404, $ex->getMessage());
        }
        if (2 != $columnInfo['type']) {
            abort(404, '此类型栏目无内容文档');
        }
        $ModelField = model('ModelField');
        $modelTable = $ModelField->getModelInfo($columnInfo['model_id'], 'table');
        //内容所有字段
        $data = $ModelField->getDataInfo($modelTable, "id='" . $id . "' and  cname='" . $name . "' and status='1'", '*', '*');
        if (empty($data)) {
            abort(404, '内容不存在或未审核');
        }
        //更新点击量
        Db::name($modelTable)->where('id', $id)->inc('hits')->update();
        //下一篇
        $nextInfo = $ModelField->getDataInfo($modelTable, "status='1' and cname='$name' and id>'$data[id]'", 'id,cname,title', '', 'id');
        if (!empty($nextInfo)) {
            $this->assign('next', ['title' => $nextInfo['title'], 'url' => $nextInfo['url']]);
        }
        //上一篇
        $prevInfo = $ModelField->getDataInfo($modelTable, "status='1' and cname='$name' and id<'$data[id]'", 'id,cname,title', '', 'id desc');
        if (!empty($prevInfo)) {
            $this->assign('prev', ['title' => $prevInfo['title'], 'url' => $prevInfo['url']]);
        }
        $list1 = model('ModelField')->getDataList($modelTable, "status='1' and cname='$name' and  id>='$data[id]'", "id,cname,title", "", 'id asc', "", [3, false, []]);
        $list2 = model('ModelField')->getDataList($modelTable, "status='1' and cname='$name' and  id<'$data[id]'", "id,cname,title", "", 'id desc', "", [2, false, []]);
        $list = array_merge($list1->getCollection()->order("id","desc")->toArray(), $list2->items());
        $clist = model('Column')->where('model_id',$columnInfo['model_id'])->order('id')->column('id,title,type,name');


        $this->assign([
            'info' => $columnInfo,
            'data' => $data,
            'list' => $list,
            'clist' => $clist,
            'crumbs' => $Column->getBreadcrumb($columnInfo['path'] . $columnInfo['id']),
            'rootName' => $this->getColumnName($columnInfo['path'] . $columnInfo['id']),
            'parentName' => $columnInfo['name'],
        ]);
        return $this->display('column/content/' . $columnInfo['template_content']);
    }

    protected function edit($cname = '', $id = 0)
    {
        if (empty($cname)) {
            $this->error('参数错误~');
        }
        $columnInfo = Db::view('column', 'name,title,model_id')
            ->view('model', 'table', 'column.model_id=model.id', 'LEFT')
            ->where('column.name', $cname)
            ->where('column.status', 1)
            ->where('model.status', 1)
            ->find();
        if (empty($columnInfo)) {
            return $this->error('栏目或内容模型不存在或被冻结');
        }
        $ModelField = model('ModelField');
        if ($this->request->isPost()) {
            $data = $this->request->post();
            $data['modelFieldExt'] = isset($data['modelFieldExt']) ? $data['modelFieldExt'] : [];
            $data['modelField']['id']=$id;
            $data['modelField']['title']=$data['title'];
            $data['modelField']['sound_url']=$data['sound_url'];
            $data['modelField']['video_url']=$data['video_url'];
            $data['modelField']['content']=$data['content'];
            try {
               // $ModelField->editModelData($columnInfo['model_id'], $data['modelField'], $data['modelFieldExt'], ['cname']);
            } catch (\Exception $ex) {
                $this->error($ex->getMessage());
            }
            //Cache::clear('db_' . $columnInfo['table']);
            $this->success('模型内容编辑成功~', FanJianConvert::joinUrl(url('column/content', ['name' => $cname,
                'id' => $id]),'scrollTo='.$data['title']),'',0);
        } else {
            $contentId = intval($id);
            if (!$contentId) {
                $this->error('参数错误cid~');
            }
            $placeList = Db::name('place')->where('mid', $columnInfo['model_id'])->whereOr('mid', 0)->order('orders,id desc')->column('id,title');
            $fieldList = model('ModelField')->getFieldList($columnInfo['model_id'], $contentId);


            $modelTable = $ModelField->getModelInfo($columnInfo['model_id'], 'table');
            //内容所有字段
            $data = $ModelField->getDataInfo($modelTable, "id='" . $id . "' and  cname='" . $cname . "' and status='1'", '*', '*');
            if (empty($data)) {
                abort(404, '内容不存在或未审核');
            }
            $data['title']="";
            $this->assign([
                'info' => $columnInfo,
                'placeList' => $placeList,
                'fieldList' => $fieldList,
                'id' => $contentId,
                'data' => $data,
                'columnTitle' => $columnInfo['title']
            ]);

            return  $this->display('column/content/beizhi_edit');
        }
    }


    protected function add($cname = '')
    {
        if (empty($cname)) {
            $this->error('参数错误~');
        }
        $columnInfo = Db::view('column', 'title,model_id')
            ->view('model', 'table', 'column.model_id=model.id', 'LEFT')
            ->where('column.name', $cname)
            ->where('column.status', 1)
            ->where('model.status', 1)
            ->find();
        if (empty($columnInfo)) {
            return $this->error('栏目或内容模型不存在或被冻结');
        }
        if ($this->request->isPost()) {
            $data = $this->request->post();
            $ModelField = model('ModelField');
            $data['modelField']['cname'] = $cname;
            $data['modelFieldExt'] = isset($data['modelFieldExt']) ? $data['modelFieldExt'] : [];

            $data['modelField']['title']=$data['title'];
            $data['modelField']['sound_url']=$data['sound_url'];
            $data['modelField']['video_url']=$data['video_url'];
            $data['modelField']['content']=$data['content'];
            $data['modelField']['status']=1;

            try {
                $ModelField->addModelData($columnInfo['model_id'], $data['modelField'], $data['modelFieldExt']);
            } catch (\Exception $ex) {
                $this->error($ex->getMessage());
            }
            Cache::clear('db_' . $columnInfo['table']);
            $this->success('模型内容编辑成功~', url('column/index', ['name' => $cname]));

        } else {
            $placeList = Db::name('place')->where('mid', $columnInfo['model_id'])->whereOr('mid', 0)->order('orders,id desc')->column('id,title');
            $fieldList = model('ModelField')->getFieldList($columnInfo['model_id']);
            $this->assign([
                'placeList' => $placeList,
                'fieldList' => $fieldList,
                'cname' => $cname,
                'columnTitle' => $columnInfo['title']
            ]);
            return  $this->display('column/content/beizhi_edit');
        }
    }

    protected function scrollTo($cname = '', $id = 0)
    {
         return  $this->display('column/content/beizhi_scrollTo');
    }

}
