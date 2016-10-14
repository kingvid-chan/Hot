var express = require('express');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//设置静态目录
app.use(express.static('public'));

app.use('/',require('./routes/index').app);

//port
var port = 3000;
app.listen(port, function(req, res) {
    console.log('app is running at port ' + port);
});