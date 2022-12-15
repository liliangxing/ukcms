
let TimeUtils = {

    /**
     * 时间浮窗
     * @param {*} x 
     * @param {*} y 
     */
    timeShow: function (x, y) {
        var window = floaty.rawWindow(
            <vertical >
                <text id="text" textSize="20sp" textColor="#00ff00" />
            </vertical>

        );

        window.setTouchable(false);//不可触摸 事件可以向下传播
        window.setPosition(x, y);

        setInterval(() => {
            ui.run(() => {
                window.text.setText(String(getTime()));
            });

        }, 100);
        return window;
    },

    /**
     * 时间浮窗
     * @param {*} x 
     * @param {*} y 
     */
    countDownTimeShow: function (x, y, endtime, adviceTime, clockOffset) {
        var window = floaty.rawWindow(
            <vertical >
                <text id="text" textSize="20sp" textColor="#00ff00" />
            </vertical>

        );

        window.setTouchable(false);//不可触摸 事件可以向下传播
        window.setPosition(x, y);

        setInterval(() => {
            ui.run(() => {
                window.text.setText(String(countDownTime(endtime, adviceTime, clockOffset)));
            });

        }, 100);
        return window;
    },

    /**
     * 获取日志时间
     */
    getLogTime: function () {
        var date = new Date();
        var hour = TT(date.getHours());
        var minute = TT(date.getMinutes());
        var second = TT(date.getSeconds());
        var millisecond = TT(date.getMilliseconds());
        return hour + ":" + minute + ":" + second + ":" + millisecond + " ";
    }
};

/**
 * 获取本机时间
 */
function getTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = TT(date.getMonth() + 1);
    var day = TT(date.getDate());
    var hour = TT(date.getHours());
    var minute = TT(date.getMinutes());
    var second = TT(date.getSeconds());
    var millisecond = TT(date.getMilliseconds());
    return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second + ":" + parseInt(millisecond / 100);
};

/**
 * 获取倒计时
 * @param {*} endtime 
 * @param {*} adviceTime 
 */
function countDownTime(endtime, adviceTime, clockOffset) {
    var nowtime = new Date(),  //获取当前时间
        endtime = new Date(endtime);  //定义结束时间
    var lefttime = endtime.getTime() - nowtime.getTime() - adviceTime - clockOffset; //距离结束时间的毫秒数
    if (lefttime < 0) {
        lefttime = -lefttime;
    }
    var leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)),  //计算天数
        lefth = Math.floor(lefttime / (1000 * 60 * 60) % 24),  //计算小时数
        leftm = Math.floor(lefttime / (1000 * 60) % 60),  //计算分钟数
        lefts = Math.floor(lefttime / 1000 % 60),  //计算秒数
        leftms = Math.floor(lefttime % 1000 / 100);  //计算毫秒秒数
    return leftd + "天" + TT(lefth) + ":" + TT(leftm) + ":" + TT(lefts) + ":" + leftms;  //返回倒计时的字符串
};

/**
 * 时间处理
 * @param {*} s 
 */
function TT(s) {
    if (s < 10) {
        s = "0" + s;
    };
    return s;
};


module.exports = TimeUtils;