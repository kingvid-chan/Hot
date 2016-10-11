var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/HotRanking');

//数据库collection
exports.HotWords = mongoose.model('HotWords',{
	name: String,
	time: Array,
	caption: String,
	createdAt: {type:Date, default:Date.now, expires:15*24*60*60}
});