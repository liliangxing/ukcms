"ui";
var color = "#009688";
//开始时间，提前时间量，提交频率，结束时间，网络时间偏移，网络接口延迟，设备延迟，辅助提交，倒计时浮窗x，倒计时浮窗y
var startTime, forwardTime, interval, lastTime, NTPClockOffset, NTPClockDelay, deviceDelay, autoSubmit, xp, yp;
//自动全选，校验价格，最大价格，刷新购物车，刷新时长，使用网络时间
var autoSelectAll, checkPrice, maxPrice, cartRefresh, duration, isUseNetTime;
//bp连接，捡漏，频率
var bpUrl, jlModel, jlhz;
var testModel;
//倒计时浮窗
var window;
//定时任务
var workId;
//存储
var storage = storages.create("hw.js");
//时间工具类
var timeUtils = require('TimeUtils.js');

//主页面
ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="详情页倒计时模式" />
                <tabs id="tabs" />
            </appbar>

            <viewpager id="viewpager">
                <frame>
                    <ScrollView>
                        <vertical w="*" h="*" margin="6" >
                            <text h="30" id="networkTest" text="正在检测网络延迟..." gravity="top|left" textColor="red" textSize="13sp" margin="0 5" />
                            <horizontal>
                                <checkbox id="isUseNetTime" text="使用网络时间" textColor="black" textSize="16" checked="true" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal>
                                <checkbox id="testModel" text="测试模式" />
                            </horizontal>

                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <checkbox id="baseTime" text="倒计时    " textColor="black" textSize="16" />
                                <text h="30" text="X：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="xp" text="360" hint="360" marginBottom="-6" textSize="16" />
                                <text h="30" text=" , Y：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="yp" text="1250" hint="1250" marginBottom="-6" textSize="16" />
                            </horizontal>
                            {/* <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <text h="30" text="bp：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="bpUrl" text="" hint="https://" marginBottom="-6" textSize="16" />
                            </horizontal> */}
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
            alert("说明", "抢购商品详情页面定时申购模式，开启定时任务，前往商品详情页面，等待定时申购。"
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
/**
 * 真人模拟滑动函数
 * 
 * 传入值：起点终点坐标
 * 效果：模拟真人滑动
 */
function randomSwipe(sx, sy, ex, ey) {
    //设置随机滑动时长范围
    var timeMin = 1000
    var timeMax = 3000
    //设置控制点极限距离
    var leaveHeightLength = 500

    //根据偏差距离，应用不同的随机方式
    if (Math.abs(ex - sx) > Math.abs(ey - sy)) {
        var my = (sy + ey) / 2
        var y2 = my + random(0, leaveHeightLength)
        var y3 = my - random(0, leaveHeightLength)

        var lx = (sx - ex) / 3
        if (lx < 0) { lx = -lx }
        var x2 = sx + lx / 2 + random(0, lx)
        var x3 = sx + lx + lx / 2 + random(0, lx)
    } else {
        var mx = (sx + ex) / 2
        var y2 = mx + random(0, leaveHeightLength)
        var y3 = mx - random(0, leaveHeightLength)

        var ly = (sy - ey) / 3
        if (ly < 0) { ly = -ly }
        var y2 = sy + ly / 2 + random(0, ly)
        var y3 = sy + ly + ly / 2 + random(0, ly)
    }

    //获取运行轨迹，及参数
    var time = [0, random(timeMin, timeMax)]
    var track = bezierCreate(sx, sy, x2, y2, x3, y3, ex, ey)

    // log("随机控制点A坐标：" + x2 + "," + y2)
    // log("随机控制点B坐标：" + x3 + "," + y3)
    // log("随机滑动时长：" + time[1])

    // log("time:"+time)
    // log("track:"+track)
    //滑动
    gestures(time.concat(track))
}


function bezierCreate(x1, y1, x2, y2, x3, y3, x4, y4) {
    //构建参数
    var h = 100;
    var cp = [{ x: x1, y: y1 + h }, { x: x2, y: y2 + h }, { x: x3, y: y3 + h }, { x: x4, y: y4 + h }];
    var numberOfPoints = 100;
    var curve = [];
    var dt = 1.0 / (numberOfPoints - 1);

    //计算轨迹
    for (var i = 0; i < numberOfPoints; i++) {
        var ax, bx, cx;
        var ay, by, cy;
        var tSquared, tCubed;
        var result_x, result_y;

        cx = 3.0 * (cp[1].x - cp[0].x);
        bx = 3.0 * (cp[2].x - cp[1].x) - cx;
        ax = cp[3].x - cp[0].x - cx - bx;
        cy = 3.0 * (cp[1].y - cp[0].y);
        by = 3.0 * (cp[2].y - cp[1].y) - cy;
        ay = cp[3].y - cp[0].y - cy - by;

        var t = dt * i
        tSquared = t * t;
        tCubed = tSquared * t;
        result_x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
        result_y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;
        curve[i] = {
            x: result_x,
            y: result_y
        };
    }

    //轨迹转路数组
    var array = [];
    for (var i = 0; i < curve.length; i++) {
        try {
            var j = (i < 100) ? i : (199 - i);
            xx = parseInt(curve[j].x)
            yy = parseInt(Math.abs(100 - curve[j].y))
        } catch (e) {
            break
        }
        array.push([xx, yy])
    }

    return array
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
    serverUrl: "https://mbuy.vmall.com/getSkuRushbuyInfo.json",
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
        var origtime = parseInt(data.currentTime);
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

    //开启时间
    ui.startTime.setText(getTime());

    //bp连接
    // ui.bpUrl.setText(storage.get("bpUrl", "").toString());

    // // 捡漏
    // ui.jlModel.checked = storage.get("jlModel", false);
    // ui.jlhz.setText(storage.get("jlhz", "5000").toString());

    ui.testModel.checked = storage.get("testModel", false);

    //是否适用网络时间
    ui.isUseNetTime.checked = storage.get("isUseNetTime", true);
    //提前时间
    ui.forwardTime.setText(storage.get("forwardTime", "100").toString());
    //设备启动延迟抵扣量
    ui.deviceDelay.setText(storage.get("deviceDelay", "80").toString());

    //提交频率
    ui.interval.setText(storage.get("interval", "100").toString());
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
    //自动支付
    // autoPay = ui.autoPay.checked;

    //bp连接
    // var bpUrlOrgin = ui.bpUrl.text();

    // if (!bpUrlOrgin) {
    //     logError("链接不能为空...");
    //     return;
    // }
    // bpUrl = bpUrlOrgin.replace("https://", "");
    // 捡漏
    testModel = ui.testModel.checked;
    // jlModel = ui.jlModel.checked;
    // jlhz = parseInt(ui.jlhz.getText());

    // //校验价格
    // checkPrice = ui.checkPrice.checked;
    // //最高价格
    // maxPrice = parseInt(ui.maxPrice.getText());

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

    // storage.put("jlModel", jlModel);
    // storage.put("bpUrl", bpUrlOrgin);
    // storage.put("jlhz", jlhz);

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
        logInfo("停止运行");
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

    logInfo("脚本开始运行，当前时间偏移: " + NTPClockOffset + " 网络延迟: " + NTPClockDelay);
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

    logCommon("华为详情页倒计时模式");
    logCommon("正在打开华为商城...");
    launchApp("华为商城");
    waitForPackage("com.vmall.client");
    logCommon("成功打开华为商城app");
    logCommon("请进入抢购商品详情页面...");

    var confirmTThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            //等待商品详情页
            // waitForActivity("com.afollestad.materialdialogs.MaterialDialog");
            //查找确认
            // var confirm = className("android.widget.TextView").textContains("确定").findOne();
            var confirm = descContains("返回活动").findOne();
            logCommon("返回活动-d:" + confirm.click());
            sleep(100);
        }
    });

    var confirmDThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            //等待商品详情页
            // waitForActivity("com.afollestad.materialdialogs.MaterialDialog");
            //查找确认
            // var confirm = className("android.widget.TextView").textContains("确定").findOne();
            var confirm = textContains("返回活动").findOne();
            logCommon("返回活动-t:" + confirm.click());
            sleep(100);
        }
    });

    var cartThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon( "结算线程");
        while (true) {
            waitForActivity("com.vmall.client.product.fragment.DiyPackageSettlementActivity");
            // log("前往购物车");
            var cart = className("android.widget.TextView").textContains("结算").findOne();
            // log(cart);
            logCommon("已经进入购物车");
            logCommon("开始结算:" + cart.click());
            sleep(100);
        }
    });

    var buyThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon( "购买线程");
        while (true) {
            waitForActivity("com.vmall.client.product.fragment.ProductDetailActivity");
            // log("进入商品详情页,等待抢购开始");
            // var subscribe = className("android.widget.TextView").textContains("立即预约").findOne();
            // log("立即预约：" + subscribe.click());
            var buyNow = textContains("立即申购").findOne();
            logCommon("立即申购：" + buyNow.click());
            sleep(100);
        }
    });

    var submitThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon( "提交线程");
        while (true) {
            // waitForActivity("com.jd.lib.settlement.fillorder.activity.NewFillOrderActivity");
            // waitForActivity("com.jingdong.app.mall.WebActivity"); //抢购
            // log("成功进入结算页");
            // var submit = className("android.widget.Button").text("提交订单").findOne();
            // var submit = className("android.widget.Button").text("提交订单").findOne();
            var submit = text("提交订单").findOne();
            if (testModel) {
                logError("测试不提交...");
            } else {
                logCommon("提交订单：" + submit.click());
                // log("提交订单：" + submit);
            }
            sleep(100);
            // break;
        }
    });

    var sollOutThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon( "售罄线程");
        while (true) {
            // waitForActivity("com.jd.lib.settlement.fillorder.activity.NewFillOrderActivity");
            // waitForActivity("com.jingdong.app.mall.WebActivity"); //抢购
            // log("成功进入结算页");
            // var submit = className("android.widget.Button").text("提交订单").findOne();
            // var submit = className("android.widget.Button").text("提交订单").findOne();
            if (textContains("已售罄").exists() && !textContains("提交订单").exists()) {
                var sellOut = textContains("已售罄").findOne();
                logCommon("已售罄，任务结束");
                // log("提交订单：" + submit);
                threads.shutDownAll();
                // break;
            }
            sleep(100);
        }
    });

    var successThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon("结束线程");
        while (true) {
            //等待支付页面
            // waitForActivity("com.jingdong.app.mall.pay.CashierDeskActivity");
            //查找确认
            var payPage = text("收银台").findOne();
            logError("下单成功");
            sleep(1000);
            // confirmThread.interrupt();
            threads.shutDownAll();
            return;
        }
    });


    waitForActivity("com.vmall.client.product.fragment.ProductDetailActivity");
    logInfo("成功进入商品详情：" + className("android.widget.TextView").textContains("GB").findOne().text());

    //检查当前商品状态
    if (textContains("今天").exists()) {
        var buyButtonScope = textContains("今天").findOne().bounds();
        logCommon("等待开抢...");
        workId = setTimeout(function () {
            doApplyJob(buyButtonScope);
        }, startChecktimeFix - getNow() - deviceDelay);

    } else if (textContains("立即申购").exists()) {
        var buyButtonScope = textContains("立即申购").findOne().bounds();
        logCommon("等待开抢...");
        workId = setTimeout(function () {
            doApplyJob(buyButtonScope);
        }, startChecktimeFix - getNow() - deviceDelay);

    } else {
        logError("非抢购商品状态商品，请待商品等待抢购之后，重新启动任务...");
        threads.shutDownAll();
    }
}


function doApplyJob(buyButtonScope) {
    logCommon("立即申购-s:" + click(buyButtonScope.centerX(), buyButtonScope.centerY()));
    var applyThread = threads.start(function () {
        //在新线程执行的代码
        // logCommon( "消息确认线程");
        while (true) {
            //等待商品详情页
            waitForActivity("com.vmall.client.product.fragment.ProductDetailActivity");
            buyButtonScope = textContains("立即申购").findOne().bounds();
            logCommon("立即申购-s:" + click(buyButtonScope.centerX(), buyButtonScope.centerY()));
            sleep(interval);
        }
    });
}