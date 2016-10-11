var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 		"localhost",
	user: 		"webadmin",
	password: 	"Web@idc",
	database: 	"HotData"
});

connection.connect(function(err){
	if (err) {
		console.error('error connecting：' + err.stack);
		return;
	}

	console.log('connected as id ' + connection.threadId);
});

connection.query('', function(err, rows, fields){
	if (err) throw err;

	console.log('The solution is：', rows[0].solution);
})

connection.end(function(err){
	if (err) throw err;
});