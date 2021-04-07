const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/login.html'],(req, res) => {
    var host = "";
    if(req.body.host != undefined){
      host = req.body.host;
    }
    var port = "";
    if(req.body.port != undefined){
      port = req.body.port;
    }
    var user = "";
    if(req.body.user != undefined){
      user = req.body.user;
    }
    var password = "";
    if(req.body.password != undefined){
      password = req.body.password;
    }
    const api = new RouterOSClient({
        host: host,
        port: port,
        user: user,
        password: password
    });

    api.connect().then((client) => {
      pool.getConnection(function(err, connection) {
        var sql_login = "SELECT * from server where host=? and port=? and user=? and password=?";
        var query_login = connection.query(sql_login,[host,port,user,password], function (err, results, fields) {
          if(!err){
            if(results.length == 0){
              var sql_insert = "insert into server(host,port,user,password) values(?,?,?,?)";
              var query_insert = connection.query(sql_insert,[host,port,user,password], function (err, results, fields) {
                if (!err){
                  api.close();
                  connection.release();
                  req.session.is_login = true;
                  req.session.server_id = results.insertId;
                  req.session.host = host;
                  req.session.port = port;
                  req.session.user = user;
                  req.session.password = password;
                  req.session.save(function(err) {
                    var data = {is_error:false,msg:"Berhasil terhubung"};
                    res.send(JSON.stringify(data));
                    res.end();
                  });
                }else{
                  api.close();
                  connection.release();
                  var data = {is_error:true,msg:"Tidak dapat menambahkan data ke database"};
                  res.send(JSON.stringify(data));
                  res.end();
                }
              });
            }else{
              api.close();
              connection.release();
              req.session.is_login = true;
              req.session.server_id = results[0]['id'];
              req.session.host = host;
              req.session.port = port;
              req.session.user = user;
              req.session.password = password;
              req.session.save(function(err) {
                var data = {is_error:false,msg:"Berhasil terhubung"};
                res.send(JSON.stringify(data));
                res.end();
              });
            }
          }else{
            api.close();
            connection.release();
            var data = {is_error:true,msg:"Tidak dapat cek data login"};
            res.send(JSON.stringify(data));
            res.end();
          }
        });
      });
    }).catch((err) => {
      var data = {is_error:true,msg:err.message};
      res.send(JSON.stringify(data));
      res.end();
    });
  });
}
