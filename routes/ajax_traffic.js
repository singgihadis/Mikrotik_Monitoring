const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/system_resources.html'],(req, res) => {
    if(req.session.is_login){
      if(req.session.server_id){
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
          client.menu("/system resource").getOnly().then((result) => {
              delete result['$$path'];
              var data = {is_error:false,data:result};
              api.close();
              res.send(JSON.stringify(data));
              res.end();
          }).catch((err) => {
            var data = {is_error:true,msg:err.message};
            res.send(JSON.stringify(data));
            res.end();
          });
        }).catch((err) => {
          var data = {is_error:true,msg:err.message};
          res.send(JSON.stringify(data));
          res.end();
        });
      }else{
        var data = {is_error:true,msg:""};
        res.send(JSON.stringify(data));
        res.end();
      }
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/master_kota_id_simpan.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var master_kota_id = "";
        if(req.body.master_kota_id != undefined){
          master_kota_id = req.body.master_kota_id;
        }
        var user_id = req.session.user_id;
        var sql = "update pengaturan set master_kota_id=? where user_id=?";
        var query = connection.query(sql,[master_kota_id,user_id], function (err, results, fields) {
          if (!err){
            connection.release();
            req.session.master_kota_id = master_kota_id;
            var data = {is_error:false,msg:"Berhasil menyimpan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:true,msg:"Gagal menyimpan"};
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
  app.post(['/ajax/system_health.html'],(req, res) => {
    if(req.session.is_login){
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
        client.menu("/system health").getOnly().then((result) => {
          if(result != null){
            delete result['$$path'];
            var data = {is_error:false,data:result};
            api.close();
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var data = {is_error:true,data:[],msg:"Data tegangan dan suhu tidak bisa diambil"};
            api.close();
            res.send(JSON.stringify(data));
            res.end();
          }
        }).catch((err) => {
          var data = {is_error:true,msg:err.message};
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
  app.post(['/ajax/interface.html'],(req, res) => {
    if(req.session.is_login){
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
        client.menu("/interface").get().then((result) => {
            var data = {is_error:false,data:result};
            api.close();
            res.send(JSON.stringify(data));
            res.end();
        }).catch((err) => {
          var data = {is_error:true,msg:err.message};
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
  app.post(['/ajax/interface_traffic.html'],(req, res) => {
    if(req.session.is_login){
      var host = req.session.host;
      var port = req.session.port;
      var user = req.session.user;
      var password = req.session.password;
      var interface = req.body.interface;
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password
      });
      api.connect().then((client) => {
        var torch = client.menu("/interface monitor-traffic").where({interface:interface}).stream((err, data_traffic, stream) => {
            if (err) return err; // got an error while trying to stream
            var data = {is_error:false,data:data_traffic};
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
  app.post(['/ajax/netwatch.html'],(req, res) => {
    if(req.session.is_login){
      var host = req.session.host;
      var port = req.session.port;
      var user = req.session.user;
      var password = req.session.password;
      var interface = req.body.interface;
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password
      });
      api.connect().then((client) => {
        client.menu("/tool netwatch").get().then((result) => {
            var data = {is_error:false,data:result};
            api.close();
            res.send(JSON.stringify(data));
            res.end();
        }).catch((err) => {
          var data = {is_error:true,msg:err.message};
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
}
