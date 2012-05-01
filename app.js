
/**
 * Module dependencies.
 */

var express = require('express')
  , Chat = require('./chat')
  , repo = require('./repository');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'sseeccrreett'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  if ( !req.session.usernick) {
    res.render('login',{'returl':'/index'});
  } else {
    var usernick = req.session.usernick;
    if (!Chat.hasUser(usernick)) {
      Chat.addUser(usernick);
    }
    res.render('index',{user:{nick:usernick}});
  }
});

app.get('/login', function(req, res){
    res.render('login',{'returl':''});
});
app.get('/logout', function(req, res){
	req.session.destroy();
    res.render('login',{'returl':''});
});

app.post('/loginPost', function(req, res) {
  var id = req.body.id
    , pw = req.body.pw;

  if (id && id.trim() !== '' && pw !== '') {
	var user = {'id':id, 'pw':pw};
    repo.loginCheck(user, req, res);
  } else {
    res.render('loginPost',{'isSuccess':false});
  }
});

//app.get('/join/:id', function(req, res) {
app.get('/listen', function(req, res) {
  var isSuccess = false
    //, roomName = req.params.id;
    , roomName = 'global';

  if (!Chat.hasRoom(roomName)) {
    Chat.addRoom(roomName);
  }
  
  isSuccess = true;
  
  res.local('layout', false) ;
  res.render('ajaxResult', {
    isSuccess: isSuccess
  });
});

app.listen(3000);

// Socket.io
require('./rooms')(app);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
