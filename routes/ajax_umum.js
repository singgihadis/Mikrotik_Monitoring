const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/master_lokasi.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "select a.nama as nama_kota_kab,a.id,b.bmkg_url,b.nama as nama_provinsi,a.bmkg_id from master_kota_kab_bmkg a left join master_provinsi b on a.master_provinsi_id=b.id";
        var query_data = connection.query(sql_data, function (err, results, fields) {
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
  app.post(['/ajax/dropdown_member.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "select a.* from member a inner join ppp_secret b on a.ppp_secret_id=b.id inner join server c on b.server_id=c.id inner join user d on c.user_id=d.id where d.id=? or d.id=?";
        var query_data = connection.query(sql_data,[req.session.user_id,req.session.parent_user_id], function (err, results, fields) {
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
  app.post(['/ajax/master_paket.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "select * from master_paket";
        var query_data = connection.query(sql_data, function (err, results, fields) {
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
  app.post(['/ajax/system_identity.html'],(req, res) => {
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
          client.menu("/system identity").getOnly().then((result) => {
              var data = {is_error:false,data:[{nama:result['name']}]};
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
}
