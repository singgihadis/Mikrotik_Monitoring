const RouterOSClient = require('routeros-client').RouterOSClient;
var ppp_function = require("../function/ppp_function.js");
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/member.html'],(req, res) => {
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
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("concat(a.name,a.password,a.profile,a.local_address,a.remote_address,a.nama) like '%" + keyword + "%'");
        }
        arr_query.push("a.server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var sql_data_total = "select count(a.id) as total from ppp_secret a LEFT JOIN member b ON a.id = b.ppp_secret_id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "SELECT a.*, IFNULL(b.nama,'') as nama,IFNULL(b.alamat,'') as alamat,IFNULL(b.no_wa,'') as no_wa,IFNULL(b.nominal_pembayaran,'0') as nominal_pembayaran FROM ppp_secret a LEFT JOIN member b ON a.id = b.ppp_secret_id " + filter_query + " limit " + limit + ",11";
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
  app.post(['/ajax/member_get.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var arr_query = [];
        arr_query.push("a.server_id=" + req.session.server_id);
        arr_query.push("a.id=" + id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "SELECT a.*, IFNULL(b.nama,'') as nama,IFNULL(b.alamat,'') as alamat,IFNULL(b.no_wa,'') as no_wa,IFNULL(b.nominal_pembayaran,'0') as nominal_pembayaran,b.id as member_id FROM ppp_secret a LEFT JOIN member b ON a.id = b.ppp_secret_id " + filter_query + "";
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
  app.post(['/ajax/member_simpan.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var alamat = "";
        if(req.body.alamat != undefined){
          alamat = req.body.alamat;
        }
        var no_wa = "";
        if(req.body.no_wa != undefined){
          no_wa = req.body.no_wa;
        }
        var nominal_pembayaran = "";
        if(req.body.nominal_pembayaran != undefined){
          nominal_pembayaran = req.body.nominal_pembayaran;
        }
        var sql_cek = "select * from member where ppp_secret_id=?";
        var query_cek = connection.query(sql_cek,[id], function (err, results, fields) {
          if(results.length == 0){
            var sql = "insert into member(ppp_secret_id,nama,alamat,no_wa,nominal_pembayaran) values(?,?,?,?,?)";
            var query = connection.query(sql,[id,nama,alamat,no_wa,nominal_pembayaran], function (err, results, fields) {
              if (!err){
                connection.release();
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
          }else{
            var sql = "update member set nama=?,alamat=?,no_wa=?,nominal_pembayaran=? where ppp_secret_id=?";
            var query = connection.query(sql,[nama,alamat,no_wa,nominal_pembayaran,id], function (err, results, fields) {
              if (!err){
                connection.release();
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
          }
        });
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/total_member.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("b.server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "select count(b.id) as total from member a right join ppp_secret b on a.ppp_secret_id=b.id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data_dibayar = "select count(a.id) as total from member a inner join ppp_secret b on a.ppp_secret_id=b.id " + filter_query;
            var query_data_dibayar = connection.query(sql_data_dibayar, function (err, results_dibayar, fields) {
              if(results_dibayar.length == 0){
                connection.release();
                var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                var total_ppp_secret = results_dibayar[0]['total'];
                var total_belum_update = total - total_ppp_secret;
                connection.release();
                var data = {is_error:false,data:[],total:total,total_belum_update:total_belum_update};
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
  app.post(['/ajax/ppp_interface_monitor.html'],(req, res) => {
    if(req.session.is_login){
      var name = "";
      if(req.body.name != undefined){
        name = req.body.name;
      }
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
        var torch = client.menu("/interface monitor-traffic").where({interface:"<pppoe-" + name + ">"}).stream((err, data_traffic, stream) => {
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
  app.post(['/ajax/member_traffic_data.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var tgl_start = "";
        if(req.body.tgl_start != undefined){
          tgl_start = req.body.tgl_start;
        }
        var tgl_end = "";
        if(req.body.tgl_end != undefined){
          tgl_end = req.body.tgl_end;
        }
        var member_id = "";
        if(req.body.member_id != undefined){
          member_id = req.body.member_id;
        }
        var sql_data = "SELECT d.* FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id INNER JOIN `server` c ON b.server_id = c.id INNER JOIN member_traffic_data d ON a.id = d.member_id and d.tgl=CURDATE() where d.tgl >= ? and d.tgl <= ? and d.id=? and b.server_id=?";
        var query_data = connection.query(sql_data,[tgl_start,tgl_end,member_id,req.session.server_id], function (err, results, fields) {
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
