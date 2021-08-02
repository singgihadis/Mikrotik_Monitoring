const RouterOSClient = require('routeros-client').RouterOSClient;
var ppp_function = require("../function/ppp_function.js");
const pool = require('../db');
const crypto = require('crypto');
module.exports = function(app){
  app.post(['/ajax/pembayaran.html'],(req, res) => {
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
        var tahun = "";
        if(req.body.tahun != undefined){
          tahun = req.body.tahun;
        }
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("a.nama like '%" + keyword + "%'");
        }
        arr_query.push("d.user_id=" + req.session.user_id);
        arr_query.push("a.awal_tagihan_bulan is not null");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var sql_data_total = "SELECT count(a.id) as total FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id INNER JOIN server d on d.id=b.server_id " + filter_query + " GROUP BY a.id";
        var query_data_total = connection.query(sql_data_total,[tahun], function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "SELECT a.id,a.nama,a.alamat,IFNULL(a.no_wa,'') as no_wa,IFNULL(a.email,'') as email,a.ppp_secret_id,a.is_berhenti_langganan,a.bulan_berhenti_langganan,a.tahun_berhenti_langganan,a.tgl_insert,a.last_update,a.nominal_pembayaran as nominal_pembayaran,a.awal_tagihan_bulan,a.awal_tagihan_tahun,IFNULL(GROUP_CONCAT(c.bulan), '') AS bulan, IFNULL(c.tahun, '') AS tahun, b.name, b.password, b.profile,c.nominal_pembayaran as nominal_pembayaran_dibayar,d.nama as nama_server,d.host,d.port,d.user,d.password FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id LEFT JOIN pembayaran c ON a.id = c.member_id and c.tahun=? INNER JOIN server d on d.id=b.server_id " + filter_query + " GROUP BY a.id limit " + limit + ",11";
            var query_data = connection.query(sql_data,[tahun], function (err, results, fields) {
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
  app.post(['/ajax/pembayaran_bayar.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var bulan = "";
        if(req.body.bulan != undefined){
          bulan = req.body.bulan;
        }
        var tahun = "";
        if(req.body.tahun != undefined){
          tahun = req.body.tahun;
        }
        var is_bayar = "";
        if(req.body.is_bayar != undefined){
          is_bayar = req.body.is_bayar;
        }
        var metode_bayar = "0";
        if(req.body.metode_bayar != undefined){
          metode_bayar = req.body.metode_bayar;
        }
        var bank_id = "0";
        if(req.body.bank_id != undefined){
          if(metode_bayar == "1" || metode_bayar == "2"){
            bank_id = req.body.bank_id;
          }
          if(bank_id == ""){
            bank_id = "0";
          }
        }
        var password = "";
        if(req.body.password != undefined){
          password = req.body.password;
          password = crypto.createHash('sha1').update(password).digest("hex");
        }
        var sql_cek_pwd = "select * from user where id=? and password=?";
        var query_cek = connection.query(sql_cek_pwd,[req.session.user_id,password], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,msg:"Password user salah"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            if(is_bayar == "1"){
              var sql_nominal = "select * from member where id=?";
              var query_nominal = connection.query(sql_nominal,[id], function (err, results, fields) {
                if(results.length == 0){
                  connection.release();
                  var data = {is_error:true,msg:"Data nominal pembayaran tidak tersedia"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  var nominal_pembayaran = results[0]['nominal_pembayaran'];
                  var sql_cek = "select * from pembayaran where member_id=? and bulan=? and tahun=?";
                  var query_cek = connection.query(sql_cek,[id,bulan,tahun], function (err, results, fields) {
                    if(results.length == 0){
                      var sql = "insert into pembayaran(member_id,bulan,tahun,metode_bayar,bank_id,nominal_pembayaran) values(?,?,?,?,?,?)";
                      var query = connection.query(sql,[id,bulan,tahun,metode_bayar,bank_id,nominal_pembayaran], function (err, results, fields) {
                        if (!err){
                          connection.release();
                          var data = {is_error:false,msg:"Berhasil melakukan pembayaran"};
                          res.send(JSON.stringify(data));
                          res.end();
                        }else{
                          connection.release();
                          var data = {is_error:true,msg:"Gagal melakukan pembayaran"};
                          res.send(JSON.stringify(data));
                          res.end();
                        }
                      });
                    }else{
                      connection.release();
                      var data = {is_error:false,msg:"Berhasil melakukan pembayaran"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }
                  });
                }
              });
            }else{
              var sql = "delete from pembayaran where member_id=? and bulan=? and tahun=?";
              var query = connection.query(sql,[id,bulan,tahun], function (err, results, fields) {
                if (!err){
                  connection.release();
                  var data = {is_error:false,msg:"Berhasil melakukan pembayaran"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  connection.release();
                  var data = {is_error:true,msg:"Gagal melakukan pmebayaran"};
                  res.send(JSON.stringify(data));
                  res.end();
                }
              });
            }
          }
        });
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/total_tagihan.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("d.user_id=" + req.session.user_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "select sum(a.nominal_pembayaran) as total from member a inner join ppp_secret b on a.ppp_secret_id=b.id inner join server d on d.id=b.server_id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            arr_query.push("c.bulan = MONTH(CURDATE())");
            if(arr_query.length > 0){
              filter_query = " where " + arr_query.join(" and ");
            }
            var sql_data_dibayar = "SELECT sum(c.nominal_pembayaran) as total FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id INNER JOIN pembayaran c ON a.id = c.member_id inner join server d on d.id=b.server_id " + filter_query;
            var query_data_dibayar = connection.query(sql_data_dibayar, function (err, results_dibayar, fields) {
              if(results_dibayar.length == 0){
                connection.release();
                var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                var total_dibayar = results_dibayar[0]['total'];
                var total_belum_dibayar = total - total_dibayar;
                connection.release();
                var data = {is_error:false,data:[],total:total,total_dibayar:total_dibayar,total_belum_dibayar:total_belum_dibayar};
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
