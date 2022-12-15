"ui";
var color = "#009688";
//开始时间，提前时间量，提交频率，结束时间，网络时间偏移，网络接口延迟，设备延迟，辅助提交，倒计时浮窗x，倒计时浮窗y
var startTime, forwardTime, interval, lastTime, NTPClockOffset, NTPClockDelay, deviceDelay, autoSubmit, xp, yp;
//自动全选，校验价格，最大价格，刷新购物车，刷新时长，使用网络时间
var autoSelectAll, checkPrice, maxPrice, cartRefresh, duration, isUseNetTime;
//bp连接，捡漏，频率
var fastJdSkuId, jlModel, jlhz;
var testModel;
//倒计时浮窗
var window;
//定时任务
var workId;
//存储
var storage = storages.create("jd_bp.js");
//时间工具类
var timeUtils = require('TimeUtils.js');

//主页面
ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="详情检测捡漏" />
                <tabs id="tabs" />
            </appbar>

            <viewpager id="viewpager">
                <frame>
                    <ScrollView>
                        <vertical w="*" h="*" margin="6" >
                            <text h="30" id="networkTest" text="正在检测网络延迟..." gravity="top|left" textColor="red" textSize="13sp" margin="0 5" />
                            <horizontal>
                                <checkbox id="isUseNetTime" text="使用网络时间" textColor="black" textSize="16" checked="true" />
                                <checkbox id="testModel" text="测试模式" textColor="black" textSize="16" checked="false" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <checkbox id="baseTime" text="倒计时    " textColor="black" textSize="16" />
                                <text h="30" text="X：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="xp" text="360" hint="360" marginBottom="-6" textSize="16" />
                                <text h="30" text=" , Y：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="yp" text="1250" hint="1250" marginBottom="-6" textSize="16" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal>
                                <checkbox id="jlModel" text="捡漏   " textColor="black" textSize="16" />
                                <text h="30" text="频率(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="jlhz" text="1000" hint="频率" marginBottom="-6" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <text h="30" text="货号：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="fastJdSkuId" text="100012043978" hint="100012043978" marginBottom="-6" textSize="16" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <text h="30" text="开始时间(年/月/日 时:分:秒)：" gravity="top|left" textColor="black" textSize="16" />
                            </horizontal>
                            <horizontal >
                                <input id="startTime" text="2020/03/03 14:30:00" hint="无" marginBottom="-6" />
                            </horizontal>
                            <horizontal >
                                <text h="30" text="提前开始时间(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="forwardTime" text="500" hint="无" marginBottom="-6" />
                            </horizontal >
                            <horizontal >
                                <text h="30" text="设备启动延迟抵扣量(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="deviceDelay" text="80" hint="无" marginBottom="-6" />
                            </horizontal >
                            <horizontal >
                                <text h="30" text="提交频率(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="interval" text="5" hint="无" marginBottom="-6" />
                            </horizontal>
                            <horizontal >
                                <text h="30" text="抢购持续时间(秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="lastTime" text="5" hint="无" marginBottom="-6" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <button id="runButton" style="Widget.AppCompat.Button.Colored" text="开始运行" />
                            <button id="stopUi" style="Widget.AppCompat.Button.Colored" text="退出" />
                        </vertical>
                    </ScrollView>
                </frame>
            </viewpager>
        </vertical>
    </drawer>
);

//*********************************************************页面交互********************************************************************** */
//显示倒计时浮窗
ui.baseTime.on("check", function (checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked) {
        timeThread = threads.start(function () {
            var clockOffset = 0;
            if (ui.isUseNetTime.isChecked()) {
                clockOffset = NTPClockOffset;
                // log("================" + NTPClockOffset)
            }
            window = timeUtils.countDownTimeShow(ui.xp.text(), ui.yp.text(), ui.startTime.text(), ui.forwardTime.text(), clockOffset);
        });
    } else if (window) {
        window.close();
        // floaty.closeAll()
        timeThread.interrupt();
    }
});

activity.setSupportActionBar(ui.toolbar);

//创建选项菜单(右上角)
ui.emitter.on("create_options_menu", menu => {
    menu.add("说明");
});
//监听选项菜单点击
ui.emitter.on("options_item_selected", (e, item) => {
    switch (item.getTitle()) {
        case "说明":
            alert("说明", "详情捡漏模式"
                + "纯模拟人工操作辅助，佛系辅助。"
                + "定时启动会有一定的延迟，不同设备略有不同，请参考预期抢购时间与开始抢购时间差值来比对，减少时间差。"
            );
            break;
    }
    e.consumed = true;
});

//退出脚本时 结束所有脚本
events.on('exit', function () {
    // engines.stopAllAndToast()
    // engines.stopAll();
    exit();
});

//启动
ui.stopUi.on("click", () => {
    //程序开始运行之前判断无障碍服务
    // toast("退出");
    // storage.clear();
    ui.finish();
});

//校验时间
ui.networkTest.on("click", () => {
    threads.start(function () {
        //重置时间
        threads.start(NTP.sync);
        //刷新延迟
        setTimeout(reflushNetTime, 500);
    });
});


//*******************************************************************页面交互***************************************************************************************** */
//*******************************************************************基础方法***************************************************************************************** */
//打开浮窗
function openConsole() {
    // logCommon( "开启浮窗");
    // "auto";
    auto.waitFor()
    //显示控制台
    var middle = device.width / 2 - 400;
    console.setSize(800, 800);
    console.setPosition(middle, 0);
    console.show();
    // console.setPosition(100, 100);
    // console.setGlobalLogConfig({
    //     "file": "/sdcard/okhp.log",
    //     "filePattern": "%d{HH:mm:ss,SSS}"
    // });

}

// 时间戳转时间字符串
function add0(m) {
    return m < 10 ? '0' + m : m
}

function add00(m) {
    if (m < 10) {
        return '00' + m;
    } else if (m < 100) {
        return '0' + m;
    } else {
        return m;
    }
}

function formatDate(needTime) {
    //needTime是整数，否则要parseInt转换
    var time = new Date(parseInt(needTime));
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    var ms = time.getMilliseconds();
    return add0(h) + ':' + add0(mm) + ':' + add0(s) + ":" + add00(ms);
}

// 根据时间偏移值计算真实时间
function getNow() {
    var now = new Date().getTime();
    if (isUseNetTime) {
        return now - NTPClockOffset;
    }
    return now;
}

// 检测时间字符串是否有效
function strDateTime(str) {
    var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    var r = str.match(reg);
    if (r == null) return false;
    var d = new Date(r[1], r[3] - 1, r[4], r[5], r[6], r[7]);
    return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4] && d.getHours() == r[5] && d.getMinutes() == r[6] && d.getSeconds() == r[7]);
}

// 获取默认开始时间
function getTime() {
    var fmt = "YYYY-MM-dd hh:mm:ss";
    var d = new Date();
    var hh = d.getHours();
    var mm = d.getMinutes();
    if (mm < 30) {
        mm = 30
    } else {
        hh += 1;
        mm = 0
    }
    var o = {
        "Y+": d.getYear() + 1900,
        "M+": d.getMonth() + 1,
        "d+": d.getDate(),
        "h+": hh,
        // "m+": d.getMinutes(),
        // "s+": d.getSeconds()
        "m+": mm,
        "s+": 0
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 4) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    fmt = fmt.replace(/-/g, '/');
    return fmt;
}

//*******************************************************************基础方法***************************************************************************************** */
//*******************************************************************滑动方法***************************************************************************************** */
/**
 * 下拉滑动
 * @param {*} duration  不能小于350ms
 */
function dropDown(duration) {
    var width = device.width;
    var height = device.height;
    var y1 = height / 2;
    var y2 = height * 3 / 4;
    var x1 = width / 2;
    var x2 = width / 2;
    // log(x1+"|"+y1+"|"+x2+"|"+y2)
    logInfo("刷新:" + swipe(x1, y1, x2, y2, duration))
}

//*******************************************************************滑动方法***************************************************************************************** */
//*******************************************************************日志处理***************************************************************************************** */
// 获取时分秒用于记录日志
function logCommon(msg) {
    console.log(formatDate(getNow()) + " " + msg);
}
function logInfo(msg) {
    console.info(formatDate(getNow()) + " " + msg);
}
function logWarn(msg) {
    console.warn(formatDate(getNow()) + " " + msg);
}
function logError(msg) {
    console.error(formatDate(getNow()) + " " + msg);
}

//*******************************************************************日志处理***************************************************************************************** */
//*******************************************************************网络时间***************************************************************************************** */

// 检测网络延迟和时间偏差
var NTP = {
    requiredResponses: 3,
    serverTimes: [],
    serverDelay: [],
    serverUrl: "https://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5",
    resyncTime: 0, // minutes
    sync: function () {
        var offset = storage.get("NTPClockOffset");
        if (offset) {
            try {
                var t = offset.split("|")[1];
                var d = NTP.fixTime() - parseInt(t, 10);
                if (d < (1000 * 60 * NTP.resyncTime)) {
                    return false;
                }
            } catch (e) {
            }
        }
        NTP.getServerTime();
    },
    getNow: function () {
        var date = new Date();
        return date.getTime();
    },
    parseServerResponse: function (data) {
        var NtpStartTime = storage.get("NtpStartTime");
        var NtpStopTime = NTP.getNow();
        var origtime = parseInt(data.currentTime2);
        var delay = ((NtpStopTime - NtpStartTime) / 2);
        var offset = NtpStopTime - origtime - delay;
        NTP.serverTimes.push(offset);
        NTP.serverDelay.push(delay);

        // 因为网络问题，需要多次获取偏移值，获取平均值
        if (NTP.serverTimes.length >= NTP.requiredResponses) {
            var sumOffset = 0;
            var sumDelay = 0;
            var i = 0;
            for (i = 0; i < NTP.serverTimes.length; i++) {
                sumOffset += NTP.serverTimes[i];
                sumDelay += NTP.serverDelay[i];
            }
            var averageOffset = Math.round(sumOffset / i);
            var averageDelay = Math.round(sumDelay / i);
            storage.put("NTPClockOffset", averageOffset + '|' + NTP.fixTime()); // 保存获得offset时的时间戳
            storage.put("NTPClockDelay", averageDelay); // 保存获得offset时的时间戳
        } else {
            NTP.getServerTime();
        }
    },
    getServerTime: function () {
        var NtpStartTime = NTP.getNow();
        storage.put("NtpStartTime", NtpStartTime);

        var res = http.get(NTP.serverUrl);
        if (res.statusCode !== 200) {
            toast("获取网络时间失败: " + res.statusCode + " " + res.statusMessage);
            return false;
        } else {
            NTP.parseServerResponse(res.body.json());
        }
    },
    fixTime: function (timeStamp) {
        if (!timeStamp) {
            timeStamp = NTP.getNow();
        }
        var offset = storage.get("NTPClockOffset");
        try {
            if (!offset) {
                offset = 0;
            } else {
                offset = offset.split("|")[0];
            }
            if (isNaN(parseInt(offset, 10))) {
                return timeStamp;
            }
            return timeStamp + parseInt(offset, 10);
        } catch (e) {
            return timeStamp;
        }
    }
};

function reflushNetTime() {
    NTPClockOffset = storage.get("NTPClockOffset", "0");
    NTPClockDelay = storage.get("NTPClockDelay", "0");
    if (!NTPClockOffset) {
        NTPClockOffset = 0;
    } else {
        NTPClockOffset = parseInt(NTPClockOffset.split("|")[0]);
    }
    if (NTPClockOffset < 0) {
        var offset_str = "慢了" + -NTPClockOffset + 'ms，'
    } else {
        offset_str = "快了" + NTPClockOffset + 'ms，'
    }
    //网络延迟数据显示
    ui.networkTest.setText("当前设备时间比平台" + offset_str + "网络延迟：" + NTPClockDelay + "ms");
}
//*******************************************************************网络时间***************************************************************************************** */
//*******************************************************************初始化设置***************************************************************************************** */
function initConfig() {
    //刷新延迟
    reflushNetTime();

    // ui.autoPay.checked = storage.get("autoPay", false);

    //开启时间
    ui.startTime.setText(getTime());

    //skuid
    ui.fastJdSkuId.setText(storage.get("fastJdSkuId", "100012043978").toString());

    // 捡漏
    ui.jlModel.checked = storage.get("jlModel", false);
    ui.jlhz.setText(storage.get("jlhz", "5000").toString());

    //是否适用网络时间
    ui.isUseNetTime.checked = storage.get("isUseNetTime", true);
    //提前时间
    ui.forwardTime.setText(storage.get("forwardTime", "100").toString());
    //设备启动延迟抵扣量
    ui.deviceDelay.setText(storage.get("deviceDelay", "80").toString());

    //提交频率
    ui.interval.setText(storage.get("interval", "300").toString());
    //持续时间
    ui.lastTime.setText(storage.get("lastTime", "5").toString());
    ui.xp.setText(storage.get("xp", "360").toString());
    ui.yp.setText(storage.get("yp", "250").toString());
}
//*******************************************************************初始化设置***************************************************************************************** */
//*******************************************************************主程序***************************************************************************************** */

// 初始化用户配置
//获取网络时间
threads.start(NTP.sync);
//初始化数据
setTimeout(initConfig, 500);


//*******************************************************************主程序***************************************************************************************** */
//*******************************************************************主程序***************************************************************************************** */

//开始
ui.runButton.on("click", () => {

    //准备参数

    //sku
    var fastJdSkuId = ui.fastJdSkuId.text();

    if (!fastJdSkuId) {
        logError("sku不能为空...");
        return;
    }

    // 捡漏
    jlModel = ui.jlModel.checked;
    jlhz = parseInt(ui.jlhz.getText());

    testModel = ui.testModel.checked;

    //开始时间
    startTime = ui.startTime.getText().toString();
    //使用网络时间
    isUseNetTime = ui.isUseNetTime.isChecked();
    //任务提前时间 毫秒
    forwardTime = parseInt(ui.forwardTime.getText());
    //设备启动延迟抵扣量
    deviceDelay = parseInt(ui.deviceDelay.getText());
    //提交订单频率 毫秒
    interval = parseInt(ui.interval.getText());
    //抢购时长
    lastTime = parseInt(ui.lastTime.getText());
    xp = parseInt(ui.xp.getText());
    yp = parseInt(ui.yp.getText());

    if (!strDateTime(startTime)) {
        ui.startTime.setError("请输入正确的日期");
        return;
    } else if (forwardTime > 1000) {
        ui.forwardTime.setError("请输入0-1000之间的值");
        return;
    }

    // storage.put("autoPay", autoPay);

    storage.put("jlModel", jlModel);
    storage.put("fastJdSkuId", fastJdSkuId);
    storage.put("jlhz", jlhz);

    storage.put("isUseNetTime", isUseNetTime);
    storage.put("forwardTime", forwardTime);
    storage.put("interval", interval);
    storage.put("lastTime", lastTime);
    storage.put("xp", xp);
    storage.put("yp", yp);

    //启动任务
    if (ui.runButton.text() == "开始运行") {
        //保持屏幕常亮
        device.keepScreenOn();
        //开启控制台
        threads.start(openConsole);
        //开始任务
        threads.start(doJob);
        ui.runButton.text("停止运行");
    } else {
        ui.runButton.text("开始运行");
        logError("停止运行");
        threads.start(function () {
            //关闭控制台
            console.hide();
            device.cancelKeepingAwake();
            // engines.stopAllAndToast();
            // engines.stopAll();
            if (workId) {
                clearTimeout(workId);
                // logInfo("取消任务：" + workId);
            }
            threads.shutDownAll();
        });
    }

    //保持脚本运行
    setInterval(() => { }, 1000);
});

/**
* 开始任务
*/
function doJob() {

    logCommon("脚本开始运行，当前时间偏移: " + NTPClockOffset + " 网络延迟: " + NTPClockDelay);
    //开始时间戳
    var startChecktime = new Date(Date.parse(startTime)).getTime();
    //获取结束时间
    var endTime = startChecktime + lastTime * 1000 - forwardTime;
    //任务开始时间
    var startChecktimeFix = startChecktime - forwardTime;
    //开始刷新的时间
    // var startFlashTime = startChecktime - flushTime;

    logInfo("预期开始抢购时间为：" + formatDate(startChecktimeFix));
    logInfo("预期结束抢购时间为：" + formatDate(endTime));



    if (endTime - getNow() < 0) {
        logError("超出预定抢购时长，抢购结束");
        threads.shutDownAll();
        return;
    }

    var stopThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            if (endTime - getNow() < 0) {
                logError("超出预定抢购时长，抢购结束");
                threads.shutDownAll();
                return;
            }
            sleep(1000);
        }
    });

    var confirmThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("sku确认线程");
        while (true) {
            //等待商品详情页
            waitForActivity("com.jingdong.common.ui.JDBottomDialog");
            //查找确认
            // var confirm = className("android.widget.TextView").textContains("确定").findOne();
            var confirm = textContains("确定").findOne();
            logCommon("确认:" + confirm.click());
            sleep(100);
        }
    });
    var readThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("消息确认线程");
        while (true) {
            //等待商品详情页
            waitForActivity("com.jingdong.common.ui.JDDialog");//com.afollestad.materialdialogs.MaterialDialog
            //查找确认
            // var confirm = className("android.widget.Button").textContains("知道啦").findOne();
            var confirm = textContains("知道啦").findOne();
            logCommon("消息确认:" + confirm.click());
            sleep(1000);
        }
    });
    var retryThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("重试线程");
        while (true) {
            //等待商品详情页
            waitForActivity("android.app.AlertDialog");
            //查找确认
            var confirm = textContains("重试").findOne();
            logCommon("重试:" + confirm.click());
            sleep(1000);
        }
    });
    var backThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("回退线程");
        while (true) {
            //等待商品详情页
            waitForActivity("android.widget.FrameLayout");
            //查找确认
            var confirm = textContains("很遗憾").findOne();
            log("结果：" + confirm.text());
            logCommon("开始返回:" + className("android.widget.ImageView").desc("返回").findOne().click());
            sleep(1500);
        }
    });
    var cartThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("结算线程");
        while (true) {
            waitForActivity("com.jd.lib.productdetail.ProductDetailActivity");
            // log("前往购物车");
            // className("android.view.View").descContains("购物车").findOne().click();
            var cart = className("android.widget.TextView").textContains("去结算").findOne();
            // log(cart);
            logCommon("已经进入购物车");
            logCommon("开始结算:" + cart.click());
            sleep(100);
        }
    });


    var successThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("结束线程");
        while (true) {
            //等待支付页面
            waitForActivity("com.jingdong.app.mall.pay.CashierDeskActivity");
            //查找确认
            var payPage = className("android.widget.TextView").text("京东收银台").findOne();
            logError("下单成功");
            sleep(1000);
            // confirmThread.interrupt();
            threads.shutDownAll();
            return;
        }
    });

    var submitThread = threads.start(function () {
        while (true) {
            var submit = text("提交订单").findOne();
            if (testModel) {
                logError("测试不提交-st");
            } else {
                logInfo("提交订单-a：" + submit.click());
            }
            sleep(interval);
        }
    });


    var buyThread = threads.start(function () {
        while (true) {
            waitForActivity("com.jd.lib.productdetail.ProductDetailActivity");

            if (textContains("立即抢购").enabled(true).exists()) {
                var buyNow = className("android.widget.TextView").textContains("立即抢购").enabled(true).findOne()
                logInfo("可以购买");
                logCommon("立即抢购：" + buyNow.click());
            } else if (textContains("已下架").exists()) {
                logCommon("已下架，退出商品详情页面...");
                if (jlModel) {
                    submitBack();
                    sleep(jlhz);
                    logCommon("打开商品详情页面...");
                    openFastPage(fastJdSkuId);
                }
            } else if (textContains("暂时无货").exists()) {
                logCommon("暂时无货，退出商品详情页面...");
                if (jlModel) {
                    submitBack();
                    sleep(jlhz);
                    logCommon("打开商品详情页面...");
                    openFastPage(fastJdSkuId);
                }
            } else if (textContains("立即购买").enabled(true).exists()) {
                var buyNow = className("android.widget.TextView").textContains("立即购买").enabled(true).findOne()
                logInfo("可以购买");
                logCommon("立即购买" + buyNow.click());
            } else if (textContains("立即预约").exists()) {
                logCommon("预约未结束，退出商品详情页面...");
                if (jlModel) {
                    submitBack();
                    sleep(jlhz);
                    logCommon("打开商品详情页面...");
                    openFastPage(fastJdSkuId);
                }
            } else if (textContains("等待预约").exists()) {
                logCommon("等待预约，退出商品详情页面...");
                if (jlModel) {
                    submitBack();
                    sleep(jlhz);
                    logCommon("打开商品详情页面...");
                    openFastPage(fastJdSkuId);
                }
            } else {
                logCommon("sleep..."+interval);
            }
            sleep(interval);
        }
    });



    workId = setTimeout(function () {
        logInfo("时间到，开始抢购，打开目标页面...");
        openFastPage(fastJdSkuId);
        waitForPackage("com.jingdong.app.mall");
    }, startChecktimeFix - getNow() - deviceDelay);
}

/**
 * 打开链接
 * @param {*} fastJdSkuId 
 */
function openFastPage(fastJdSkuId) {
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "openapp.jdmobile://virtual?params=" + encodeURIComponent('{"category":"jump","des":"productDetail","skuId":"' + ui.fastJdSkuId.text() + '"}'),
        packageName: "com.jingdong.app.mall",
    });
}

/**
* 退出提交订单页面
*/
function submitBack() {
    if (className("android.widget.ImageView").desc("返回").exists()) {
        console.log(timeUtils.getLogTime(), "退出目标页，等待延迟后重试：" + className("android.widget.ImageView").desc("返回").findOne().click());
    }
}