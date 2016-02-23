var app = require('express')(),
    http = require('http').Server(app),
		io = require('socket.io')(http);

app.get('/chat', function(req, res) {
  res.sendFile(__dirname + '/public/chat.html');
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  socket.broadcast.emit('connection message', 'A user connected.');
	socket.on('disconnect', function() {
    if (socket.nickname) {
      socket.broadcast.emit('disconnect message', socket.nickname + ' disconnected');
    } else
      socket.broadcast.emit('disconnect message', 'A user disconnected.');
    }
	});
	socket.on('chat message', function(msg) {
    if (socket.nickname) {
      io.emit('chat message', '<span class="nickname">' + socket.nickname + '</span> ' + msg);
    } else {
      io.emit('chat message', '<span class="nickname">anonymous</span> ' + msg);
    }
	});
  socket.on('add nickname', function(nickname) {
    socket.nickname = nickname;
    socket.broadcast.emit('nickname added', socket.nickname);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
