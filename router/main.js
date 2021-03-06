module.exports = function(name, server, io) {
	require('date-utils')

	const soc = io.of('/')
	soc.use(function(socket, next) {
		let userID = socket.handshake.query.user
		if(userID) {
			socket.join(userID)
		}
		else {
			socket.on('disconnect', function(){})
		}
		next()
	})

	const Ejs = require('ejs')
	const ejsHandler = (request, h) => {
		return h.view('index', {
			title: 'Request Viewer',
			year: new Date().getFullYear(),
			ejs: {
				_server: server.info,
				_params: request.params,
				_payload: request.payload,
				user: encodeURIComponent(request.params.user)
			}
		})
	}
	server.views({
		engines: { ejs: Ejs },
		relativeTo: __dirname,
		path: '../public/'
	})


	// 라우트
	server.route([
		// 웹
		{
			method: 'GET',
			path: '/',
			handler: ejsHandler
		},
		{
			method: 'GET',
			path: '/{user}',
			handler: ejsHandler
		},
		// js
		{
			method: 'GET',
			path: '/js/{param*}',
			handler: {
				directory: {
					path: './public/assist/js/',
					listing: true
				}
			}
		},
		// css
		{
			method: 'GET',
			path: '/css/{param*}',
			handler: {
				directory: {
					path: './public/assist/css/',
					listing: true
				}
			}
		},
		// img
		{
			method: 'GET',
			path: '/img/{param*}',
			handler: {
				directory: {
					path: './public/assist/img/',
					listing: true
				}
			}
		},
		// fonts
		{
			method: 'GET',
			path: '/fonts/{param*}',
			handler: {
				directory: {
					path: './public/assist/fonts/',
					listing: true
				}
			}
		},
		// 소켓
		{
			method: ['POST', 'GET'],
			path: '/log/{user}',
			handler: function (request, h) {
				var ip = request.headers['x-real-ip'] || request.info.remoteAddress
				var user = encodeURIComponent(request.params.user)
				var date = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
				var data = request.payload
				if(data == null) data = request.query
				var method = request.method

				var sendData = {sender: ip, date: date, method:method, data: data}
				soc.in(user).emit('log', JSON.stringify(sendData));
				return { result: true }
			},
			config: {
				cors: {
					origin: ['*'],
					additionalHeaders: ['cache-control', 'x-requested-with']
				}
			}
		},
	])
}
