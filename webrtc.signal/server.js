var app = require('express')();
var port = process.env.SocketIO_PORT || '9000';

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(port);

io.on('connection', function (socket) {
    socket.emit('connected', { 'sessionID': socket.id });

    socket.on('store_announce', ({hashes}) => {
        console.log('announce', hashes);
        hashes.map(hash => socket.join(hash));
    });

    socket.on('store_lookup', (payload) => {
        console.log('lookup', payload.hash, payload);
        io.to(payload.hash).emit('message', payload);
    });

    socket.on('join', address => {
        console.log('join', address);
        socket.join(address);
    });

    socket.on('message', payload => {
        console.log('message', payload);
        io.to(payload.to).emit('message', payload.message);
    });

    socket.on('disconnect', function (data) {
        console.log('disconnect', data);
    });
});
