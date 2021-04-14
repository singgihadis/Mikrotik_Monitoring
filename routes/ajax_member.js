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
}
