const RouterOSClient = require('routeros-client').RouterOSClient;
var ppp_function = require("../function/ppp_function.js");
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/ppp_secret_total.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("a.server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "select count(a.id) as total, count(b.id_ppp) as total_aktif from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            connection.release();
            var data = {is_error:false,data:results_total};
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
  app.post(['/ajax/ppp_secret.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var page = 1;
        if(req.body.page != undefined){
          page = req.body.page;
        }
        var keyword = "";
        if(req.body.keyword != undefined){
          keyword = req.body.keyword;
        }
        var is_active = "";
        if(req.body.is_active != undefined){
          is_active = req.body.is_active;
        }
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("(concat(a.name,a.password,a.profile) like '%" + keyword + "%' or b.address like '%" + keyword + "%')");
        }
        if(is_active != ""){
          if(is_active == "1"){
            arr_query.push("b.id_ppp is not null");
          }else if(is_active == "0"){
            arr_query.push("b.id_ppp is null");
          }
        }
        arr_query.push("a.server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var sql_data_total = "select count(a.id) as total from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "select a.*,IF(b.id_ppp is null,0,1) as is_active,b.address as address from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` " + filter_query + " limit " + limit + ",11";
            var query_data = connection.query(sql_data, function (err, results, fields) {
              if(results.length == 0){
                connection.release();
                var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:false,data:results,total:total};
                res.send(JSON.stringify(data));
                res.end();
              }
            });
          }
        });
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/ppp_secret_simpan.html'],(req, res) => {
    if(req.session.is_login){
      var host = req.session.host;
      var port = req.session.port;
      var user = req.session.user;
      var password = req.session.password;
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password,
          keepalive: true
      });
      api.connect().then((client) => {
        client.menu("/ppp secret").get().then((result) => {
            var server_id = req.session.server_id;
            ppp_function.Simpan_Secret(0,server_id,result.length,result,function(){
              var data = {is_error:false,data:[],msg:"Berhasil"};
              api.close();
              res.send(JSON.stringify(data));
              res.end();
            });
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
  app.post(['/ajax/ppp_active_connection_simpan.html'],(req, res) => {
    if(req.session.is_login){
      var host = req.session.host;
      var port = req.session.port;
      var user = req.session.user;
      var password = req.session.password;
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password,
          keepalive: true
      });
      api.connect().then((client) => {
        client.menu("/ppp active").get().then((result) => {
            var server_id = req.session.server_id;
            pool.getConnection(function(err, connection) {
              var sql_delete = "delete from ppp_active_connection where server_id=?";
              var query_delete = connection.query(sql_delete, [server_id], function (err, results_delete, fields) {
                if(err){
                  connection.release();
                  var data = {is_error:true,data:[],msg:"Gagal hapus ppp active connection"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  connection.release();
                  ppp_function.Simpan_Active_Connection(0,server_id,result.length,result,function(){
                    var data = {is_error:false,data:[],msg:"Berhasil"};
                    api.close();
                    res.send(JSON.stringify(data));
                    res.end();
                  });
                }
              });
            });
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
