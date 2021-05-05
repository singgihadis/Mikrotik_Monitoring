const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/ping.html'],(req, res) => {
    if(req.session.is_login){
      var client_ip = "";
      if(req.body.client_ip != undefined){
        client_ip = req.body.client_ip;
      }
      var high_value = "";
      if(req.body.high_value != undefined){
        high_value = req.body.high_value;
      }
      var host = req.session.host;
      var port = req.session.port;
      var user = req.session.user;
      var password = req.session.password;
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password
      });
      api.connect().then((client) => {
        var torch = client.menu("/ping").where({address:client_ip}).stream((err, data, stream) => {
            if (err) return err; // got an error while trying to stream
            var data = {is_error:false,data:data};
            torch.stop();
            api.close();
            res.send(JSON.stringify(data));
            res.end();
        });
      }).catch((err) => {
        var data = {is_error:true,msg:err.message};
        res.send(JSON.stringify(data));
        res.end();
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/ping_data.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var tgl_start = "";
        if(req.body.tgl_start != undefined){
          tgl_start = req.body.tgl_start;
        }
        var tgl_end = "";
        if(req.body.tgl_end != undefined){
          tgl_end = req.body.tgl_end;
        }
        var sql_data = "select a.* from ping_data a inner join monitoring b on a.monitoring_id=b.id where a.tgl >= ? and a.tgl <= ? and b.server_id=? and b.id=?";
        var query_data = connection.query(sql_data,[tgl_start,tgl_end,req.session.server_id,id], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:false,data:results};
            res.send(JSON.stringify(data));
            res.end();
          }
        });
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
