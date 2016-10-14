var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 		"localhost",
	user: 		"root",
	password: 	"kingvid",
	database: 	"HOTDATA",
	dateStrings: true
});

connection.connect(function(err){
	if (err) {
		console.error('error connecting：' + err.stack);
		return;
	}
	console.log('DB connected');
});
exports.db_INSERT_t1 = function(obj){
	connection.query('INSERT INTO t1 SET ?', obj, function(err, result){
		if (err) throw err;
		// console.log('INSERT 1 Row');
	})
};
exports.db_INSERT_t2 = function(obj){
	connection.query('INSERT INTO t2 SET ?', obj, function(err){
		if (err) return;
	})
};
exports.db_SELECT_ONE = function(name, callback){
	connection.query('SELECT * FROM t1 WHERE name = ?',[name], function(err, rows, fields){
		if (err) throw err;
		// console.log('The solution is：', rows);
		callback(rows);
	})
};
exports.db_SELECT_ALL = function(callback){
	connection.query('SELECT * FROM t2', function(err, rows, fields){
		if (err) throw err;
		// console.log('The solution is：', rows);
		callback(rows);
	})
};

// connection.query('DELETE FROM HOTDATA_TABLE WHERE name = "test"', function(err, result){
// 	if (err) throw err;

// 	console.log('deleted ' + result.affectedRows + ' rows');
// })

// connection.end();