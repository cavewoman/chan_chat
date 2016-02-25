var express = require('express'),
    app = express(),
    http = require('http').Server(app),
		io = require('socket.io')(http);

app.use(express.static('public'));
app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/public/chat.html');
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

var users = {};
var rooms = ['general', 'keyboards', 'skateboarding', 'random'];

io.on('connection', function(socket) {
  io.sockets.emit('user connection', users);
	socket.on('disconnect', function() {
    if (socket.nickname) {
      users[socket.nickname] = 'offline';
      socket.broadcast.emit('disconnect message', socket.nickname);
    }
	});
	socket.on('chat message', function(msg) {
    if (msg) {
      if (socket.nickname) {
        io.sockets.in(socket.room).emit('chat message', '<span class="nickname">' + socket.nickname + '</span> ' + msg);
      } else {
        io.sockets.in(socket.room).emit('chat message', '<span class="nickname">anonymous</span> ' + msg);
      }
    }
	});
  socket.on('add nickname', function(nickname) {
    socket.nickname = nickname;
    socket.room = 'general';
    users[nickname] = 'online';
    socket.join('general');
    socket.emit('updaterooms', rooms, 'general');
    socket.emit('centered chat message', 'You have connected to general');
    io.sockets.emit('nickname added', nickname);
  });
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('centered chat message', 'You have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('centered chat message', socket.nickname+' has left '+socket.room);
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('centered chat message', socket.nickname+' has joined '+newroom);
		socket.emit('updaterooms', rooms, newroom);
	});
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
