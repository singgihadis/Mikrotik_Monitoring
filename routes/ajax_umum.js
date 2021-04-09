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
  app.post(['/ajax/system_identity.html'],(req, res) => {
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
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
