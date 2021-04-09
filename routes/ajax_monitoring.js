const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/monitoring_tambah.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var client_ip = "";
        if(req.body.client_ip != undefined){
          client_ip = req.body.client_ip;
        }
        var normal_value = "";
        if(req.body.normal_value != undefined){
          normal_value = req.body.normal_value;
        }
        var high_value = "";
        if(req.body.high_value != undefined){
          high_value = req.body.high_value;
        }
        var server_id = req.session.server_id;
        var sql_insert = "insert into monitoring(server_id,nama,client_ip,normal_value,high_value) values(?,?,?,?,?)";
        var query_insert = connection.query(sql_insert,[server_id,nama,client_ip,normal_value,high_value], function (err, results, fields) {
          if (!err){
            connection.release();
            var data = {is_error:false,msg:"Berhasil menambahkan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:true,msg:"Tidak dapat menambahkan data ke database"};
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
  app.post(['/ajax/monitoring_data.html'],(req, res) => {
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
        var is_run = "";
        if(req.body.is_run != undefined){
          is_run = req.body.is_run;
        }
        var arr_query = [];
        if(is_run != ""){
          arr_query.push("is_run=" + is_run);
        }
        if(keyword != ""){
          arr_query.push("concat(client_ip,nama) like '%" + keyword + "%");
        }
        arr_query.push("server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 5) - 5;
        var sql_data = "select * from monitoring " + filter_query + " order by tgl_insert desc limit " + limit + ",6";
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
  app.post(['/ajax/ping_run.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var sql = "update monitoring set is_run=1 where id=?";
        var query = connection.query(sql,[id], function (err, results, fields) {
          if (!err){
            connection.release();
            var data = {is_error:false,msg:"Berhasil menjalankan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:true,msg:"Tidak dapat menjalankan"};
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
  app.post(['/ajax/ping_stop.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var sql = "update monitoring set is_run=0 where id=?";
        var query = connection.query(sql,[id], function (err, results, fields) {
          if (!err){
            connection.release();
            var data = {is_error:false,msg:"Berhasil menghentikan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:true,msg:"Tidak dapat menghentikan"};
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
