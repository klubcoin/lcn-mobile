var app = require('express')();
var port = '8808';

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(port);

io.on('connection', function (socket) {
  socket.emit('connected', { 'sessionID': socket.id });
  socket.join('slaves');

  socket.on('message', function (data) {
    data.slaveId = socket.id;
    socket.broadcast.to('slaves').emit('message', data);
  });

  socket.on('disconnect', function (data) {
    console.log('disconnect', data);
  });
});
