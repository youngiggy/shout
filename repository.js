var mysql = require('mysql')
	, DATABASE = 'shout'
	, TABLE_USER = 'user'
	, client = mysql.createClient({
		 user: 'root'
		,password: 'ajdajde'
	});
	
client.query('USE '+ DATABASE);

var mysqlUtil = module.exports = {
    insertUser: function(user, res) {
      client.query(
          'INSERT INTO ' + TABLE_USER + ' SET id = ?, pw = ?, nick = ?, email = ?'
        , [user.id, user.pw, user.nick, user.email]
        , function(err) {
            client.query(
                'SELECT * FROM ' + TABLE_USER + ' WHERE id = ?'
              , [user.id]
              , function(err, results, fields) {
                  if (err) {
                    throw err; 
                  } 
                  res.render('join-result', {
                      viewData: results[0]
                  });
            });
          }
      );
    }
  , hasNameAndEmail: function(user, res) {
      client.query(
          'SELECT * FROM ' + TABLE_USER + ' WHERE id = ? OR nick = ? OR email = ?'
        , [user.id, user.nick, user.email]
        , function(err, results, fields) {
            if (err) {
              throw err;
            }
            if (results.length > 0) {
              res.render('join-fail', {
                  title: 'shout > { )'
              });
            } else {
              mysqlUtil.insertUser(user, res);
            }
      });
    }
  , loginCheck: function(user, req, res) {
	  var isSuccess = false;
      client.query(
          'SELECT * FROM ' + TABLE_USER + ' WHERE id = ? AND pw = ?'
        , [user.id, user.pw]
        , function(err, results, fields) {
            if (err) {
              throw err;
            }
            if (results.length > 0) {
				req.session.userid = results[0].id;
				req.session.usernick = results[0].nick;
				isSuccess = true;
            }
			res.render('loginPost',{'isSuccess':isSuccess});
      });
    }
};
