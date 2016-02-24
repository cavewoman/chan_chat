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

io.on('connection', function(socket) {
  io.emit('user connection', users);
	socket.on('disconnect', function() {
    if (socket.nickname) {
      users[socket.nickname] = 'offline';
      socket.broadcast.emit('disconnect message', socket.nickname);
    }
	});
	socket.on('chat message', function(msg) {
    if (msg) {
      if (socket.nickname) {
        io.emit('chat message', '<span class="nickname">' + socket.nickname + '</span> ' + msg);
      } else {
        io.emit('chat message', '<span class="nickname">anonymous</span> ' + msg);
      }
    }
	});
  socket.on('add nickname', function(nickname) {
    users[nickname] = 'online';
    socket.nickname = nickname;
    io.emit('nickname added', nickname);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
