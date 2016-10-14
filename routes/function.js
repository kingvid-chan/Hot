var cheerio = require('cheerio');
var superagent = require('superagent');
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
exports.getRealTimeHot = function (callback){
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
exports.getTotalHot = function (callback){
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