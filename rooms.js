var Chat = require('./chat');

module.exports = function(app) {
  var io = require('socket.io').listen(app);
  
  io.configure(function(){
    io.set('log level', 3);
    io.set('transports', [
        'websocket'
      , 'flashsocket'
      , 'htmlfile'
      , 'xhr-polling'
      , 'jsonp-polling'
    ]);
  });

  var Room = io
    .of('/room')
    .on('connection', function(socket) {
      var joinedRoom = null;
      socket.on('join', function(data) {
		//예외처리 : 현재 방 개념이 없음
		data.roomName = 'global';
  console.log('roomList='+Chat.getRoomList());
  console.log(Chat.hasRoom(data.roomName));
        if (Chat.hasRoom(data.roomName)) {
          joinedRoom = data.roomName;
          socket.join(joinedRoom);
          socket.emit('joined', {
            isSuccess:true, nickName:data.nickName
          });
          /*
          socket.broadcast.to(joinedRoom).emit('joined', {
            isSuccess:true, nickName:data.nickName
          });
          */
          Chat.joinRoom(joinedRoom, data.nickName);
        } else {
          socket.emit('joined', {isSuccess:false});
        }
      });

      socket.on('message', function(data) {
		  console.log('on message:joinedRoom='+joinedRoom);
        if (joinedRoom) {
          socket.broadcast.to(joinedRoom).json.send(data);
        } 
      });

      socket.on('leave', function(data) {
        if (joinedRoom) {
          Chat.leaveRoom(joinedRoom, data.nickName);
          socket.broadcast.to(joinedRoom).emit('leaved', {
            nickName:data.nickName
          });
          socket.leave(joinedRoom);
        }
      });
    });
}
