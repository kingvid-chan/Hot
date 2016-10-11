var express = require('express');
var fs = require('fs');
var path = require('path');
// var HotWords = require('./db').HotWords;
var schedule = require("node-schedule");
var cheerio = require('cheerio');
var superagent = require('superagent');
var urlencode = require('urlencode');
var moment = require('moment');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//设置静态目录
app.use(express.static('public'));
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
//获取综合热点数据接口
app.get('/getTotalHotData', function(req, res, next){
    getTotalHot(function(data){
        res.send({ data: data.dataArray });
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

//port
var port = 3000;
app.listen(port, function(req, res) {
    console.log('app is running at port ' + port);
});

//转义html的unicode格式
function htmlDecode(str) {
    // 一般可以先转换为标准 unicode 格式（有需要就添加：当返回的数据呈现太多\\\u 之类的时）
    str = unescape(str.replace(/\\u/g, "%u"));
    // 再对实体符进行转义
    // 有 x 则表示是16进制，$1 就是匹配是否有 x，$2 就是匹配出的第二个括号捕获到的内容，将 $2 以对应进制表示转换
    str = str.replace(/&#(x)?(\w+);/g,
        function($, $1, $2) {
            return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
        });
    return str;
}

//获取实时热搜词排行榜
function getRealTimeHot(callback){
    superagent.get('http://s.weibo.com/top/summary?cate=realtimehot')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36')
        .end(function(err, sres) {
            if (err) { console.log('error!');}

            var $ = cheerio.load(sres.text);
            var HTML = "";
            $('script').each(function() {
                var html = $(this).html();
                if (html.indexOf('STK.pageletM.view') !== -1 && html.indexOf('"html":') !== -1) {
                    var startPos = html.indexOf('"html":') + 8;
                    var endPos = html.lastIndexOf('"');
                    html = html.slice(startPos, endPos).replace(/\\"/g, '"').replace(/\\\//g, '/').replace(/\\n/g, '');
                    HTML += html;
                }
            })
            HTML = htmlDecode(HTML);
            $ = cheerio.load(HTML, { normalizeWhitespace: true });
            var dataArray = [];
            var bool = false;
            var keyWords = '';
            $('#realtimehot tr').each(function(index) {
                if (index === 0 || bool) {
                    return;
                }
                var data = {};
                data.y = parseInt($(this).find('.td_03').text());
                if (data.y >= 100000) {
                    data.url = 'http://s.weibo.com' + $(this).find('.td_02 a').attr("href");
                    data.name = $(this).find('.td_02 a').text();
                    dataArray.push(data);
                    keyWords = keyWords + index + '、' + data.name + '\n';
                } else {
                    bool = true;
                    keyWords = keyWords.slice(keyWords.Length - 2, -1);
                }
            });
            callback({
                keyWords: keyWords,
                dataArray: dataArray
            });  //异步回调函数
        });
        
}


//获取综合热搜词排行榜
function getTotalHot(callback){
    superagent.get('http://s.weibo.com/top/summary?cate=total&key=all')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36')
        .end(function(err, sres) {
            if (err) { console.log('error!')}

            var $ = cheerio.load(sres.text);
            var HTML = "";
            $('script').each(function() {
                var html = $(this).html();
                if (html.indexOf('STK.pageletM.view') !== -1 && html.indexOf('"html":') !== -1) {
                    var startPos = html.indexOf('"html":') + 8;
                    var endPos = html.lastIndexOf('"');
                    html = html.slice(startPos, endPos).replace(/\\"/g, '"').replace(/\\\//g, '/').replace(/\\n/g, '');
                    HTML += html;
                }
            })
            HTML = htmlDecode(HTML);
            $ = cheerio.load(HTML, { normalizeWhitespace: true });
            var dataArray = [];
            $('#all tr').each(function(index) {
                if (index === 0) {
                    return;
                }
                dataArray.push({
                    y: parseInt($(this).find('.td_03').text()),
                    url: 'http://s.weibo.com' + $(this).find('.td_02 a').attr("href"),
                    name: $(this).find('.td_02 a').text()
                });
            });
            callback({
                dataArray: dataArray
            });  //异步回调函数
        });
}