var app = require('express')();
var port = process.env.SocketIO_PORT || '9000';

const SERVER_POOL_URL = 'http://localhost:3002';

var slaveId = 0;
const request = require('request');
const clientIO = require('socket.io-client');
const socketClient = clientIO(SERVER_POOL_URL, {
    reconnectionDelayMax: 10000,
    query: {
        auth: 'slave'
    }
});
socketClient.on('connected', function (data) {
    slaveId = data.sessionID;
})
socketClient.on('message', function (data) {
    if (data.slaveId && data.slaveId == slaveId) {
        //ignore retransmitted
        return;
    }
    // forward message
    io.in(data.roomId).emit('message', data)
})

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(port);

io.on('connection', function (socket) {
    socket.emit('connected', { 'sessionID': socket.id });

    /*
      If a peer is initiator, he will create a new room
      otherwise if peer is receiver he will join the room
  */
    socket.on('join', address => {
        console.log('join', address)
        socket.join(address);
    });

    /*
        The initiating peer offers a connection
    */
    socket.on('offer', payload => {
        io.to(payload.target).emit('offer', payload);
    });

    /*
        The receiving peer answers (accepts) the offer
    */
    socket.on('answer', payload => {
        io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', incoming => {
        io.to(incoming.target).emit('ice-candidate', incoming.candidate);
    })

    socket.on('disconnect', function (data) {
        console.log('disconnect', data);
    });
});
