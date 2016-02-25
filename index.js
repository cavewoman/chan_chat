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
var messages = {};
rooms.forEach(function(room) {
  messages[room] = [];
});

io.on('connection', function(socket) {
  io.sockets.emit('user connection', users, messages['general']);
	socket.on('disconnect', function() {
    users[socket.nickname] = 'offline';
    var msg = socket.nickname + ' disconnected.';
    socket.broadcast.emit('disconnect message', socket.nickname, msg);
	});
	socket.on('chat message', function(msg) {
    if (msg) {
      var message = '<span class="nickname">' + socket.nickname + '</span> ' + msg;
      messages[socket.room].push({ message: message, centered: false });
      io.sockets.in(socket.room).emit('chat message', message);
    }
	});
  socket.on('add nickname', function(nickname) {
    socket.nickname = nickname;
    socket.room = 'general';
    users[nickname] = 'online';
    socket.join('general');
    socket.emit('updaterooms', rooms, 'general');
    socket.emit('centered chat message', 'You have connected to general');
    var msg = '<span class="joined-message">' + socket.nickname + ' has joined.</span>';
    messages['general'].push({ message: msg, centered: true });
    io.sockets.emit('nickname added', nickname, msg);
  });
	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('centered chat message', 'You have connected to '+ newroom);
		// sent message to OLD room
    var leaveMessage = socket.nickname + ' has left ' + socket.room;
    messages[socket.room].push({ message: leaveMessage, centered: true });
		socket.broadcast.to(socket.room).emit('centered chat message', socket.nickname+' has left '+socket.room);
		// update socket session room title
		socket.room = newroom;
    var joinMessage = socket.nickname + ' has joined ' + newroom;
    messages[newroom].push({message: joinMessage, centered: true});
		socket.broadcast.to(newroom).emit('centered chat message', socket.nickname+' has joined '+newroom);
		socket.emit('updaterooms', rooms, newroom, messages[newroom]);
	});
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
