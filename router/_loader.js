module.exports.loader = function(name, arg) {
	//var args = Array.from(arguments).slice(1)
	var args = arguments
	var modules = require('./'+name+'.js').apply(null, args)
}