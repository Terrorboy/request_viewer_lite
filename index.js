const Path = require('path')
const Vision = require('vision')
const Inert = require('inert')
const Hapi = require('hapi')
const SocketIO = require('socket.io')

var fs = require('fs')
var options = {
	  key: fs.readFileSync('/etc/letsencrypt/live/z9n.net/privkey.pem')
	, cert: fs.readFileSync('/etc/letsencrypt/live/z9n.net/cert.pem')
	, ca: fs.readFileSync('/etc/letsencrypt/live/z9n.net/chain.pem')
}
const server = Hapi.server({ port: 7777, tls: options })

const init = async () => {

	await server.register(Vision)
	await server.register(Inert)

	// SocketIO 생성
	const io = SocketIO.listen(server.listener)

	// 라우터
	var rl = require('./router/_loader.js')
	rl.loader('main', server, io) // router/main.js

	// 서버시작
	await server.start()
	console.log(`Server running at: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
	console.log(err)
	process.exit(1)
})
init()