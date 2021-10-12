const pool = require('../db');
const crypto = require('crypto');
module.exports = function(app){
  app.post(['/ajax/login.html'],(req, res) => {
    var user = "";
    if(req.body.user != undefined){
      user = req.body.user;
    }
    var password = "";
    if(req.body.password != undefined){
      password = req.body.password;
      password = crypto.createHash('sha1').update(password).digest("hex");
    }
    pool.getConnection(function(err, connection) {
      var sql_login = "SELECT * from user where user=? and password=? and status=1";
      var query_login = connection.query(sql_login,[user,password], function (err, results, fields) {
        if(results.length > 0){
          req.session.is_login = true;
          req.session.user_id = results[0]['id'];
          req.session.nama = results[0]['nama'];
          req.session.parent_user_id = results[0]['parent_user_id'];
          req.session.level = results[0]['level'];
          connection.release();
          req.session.save(function(err) {
            var data = {is_error:false,msg:"Berhasil login"};
            res.send(JSON.stringify(data));
            res.end();
          });
        }else{
          connection.release();
          var data = {is_error:true,msg:"User atau password salah"};
          res.send(JSON.stringify(data));
          res.end();
        }
      });
    });
  });
}
