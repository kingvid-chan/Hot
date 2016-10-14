var getRealTimeHot = require('./function').getRealTimeHot;
var getTotalHot = require('./function').getTotalHot;
var db_INSERT_t1 = require('../db').db_INSERT_t1;
var db_INSERT_t2 = require('../db').db_INSERT_t2;
var db_SELECT_ONE = require('../db').db_SELECT_ONE;
var db_SELECT_ALL = require('../db').db_SELECT_ALL;
var express = require('express');
var fs = require('fs');
var path = require('path');
var schedule = require("node-schedule");
var urlencode = require('urlencode');
var moment = require('moment');
var eventproxy = require('eventproxy');

var app = express();
//访问入口
app.get('/', function(req, res, next) {
    res.render('index');
});
//获取实时热点数据接口
app.get('/getRealHotData', function(req, res, next){
    getRealTimeHot(function(data){
        res.send({ data: data.dataArray });
    });
});
//趋势曲线
app.get('/Tendency', function(req, res, next){
    db_SELECT_ALL(function(result){
        result.forEach(function(value){
            var data = {
                name: value.name,
                url: value.url
            }
            db_SELECT_ONE(value.name, function(result){
                var arr = [];
                result.forEach(function(value){
                    arr.push([value.time, value.y]);
                    // arr.push([Date.parse(new Date(value.time)), value.y]);
                })
                data.data = arr;
                ep.emit('got_all_data', data);
            })
            
        });

        var ep = new eventproxy();
        ep.after('got_all_data', result.length, function(dataArray){
            res.send({data: dataArray});
        })
    });
})



//定时更新数据
schedule.scheduleJob('0 0 * * * *', function(){
    //获取综合热点数据接口
    var now = moment().format('YYYY-MM-DD H');
    getTotalHot(function(result){
        result.dataArray.forEach(function(value){
            db_INSERT_t1({
                name: value.name,
                y: value.y,
                time: now
            });
            db_INSERT_t2({
                name: value.name,
                url: value.url
            });
        })
    });
});


//跟qqbot服务通信，获取登陆二维码
app.get('/getqr', function(req, res, next) {
    var img_path = './images/qr.jpg';
    var path = "./public/images/qr.jpg";
    var req_img = superagent.get('http://localhost:3100');
    req_img.pipe(fs.createWriteStream(path));
    req_img.on("end", function(err, sres) {
        res.send('<img src=' + img_path + ' style="display:block;width:200px;height:200px;margin:auto;">');
    });
});
//设置定时任务，将实时热搜词通知到qq讨论组
app.get('/inform', function(req, res, next) {
    getRealTimeHot(function(data){
        //发出QQ提醒http请求
        var day = moment().format('l');
        var words = '【热搜榜】' + day + '：\n' + data.keyWords + '\n【点击以下链接可查看详情：http://10.187.139.235/index】';
        var url = 'http://localhost:3200/send?type=group&to=' + urlencode("广财大地旅外联部") + '&msg=' + urlencode(words);
        superagent.get(url).end(function(err, res) {
                console.log('inform done!', day);
            });
    });
});

module.exports.app = app;