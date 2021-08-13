const RouterOSClient = require('routeros-client').RouterOSClient;
var ppp_function = require("../function/ppp_function.js");
var member_function = require("../function/member_function.js");
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
        arr_query.push("(d.user_id=" + req.session.user_id + " or d.user_id=" + req.session.parent_user_id + ")");
        arr_query.push("a.awal_tagihan_bulan is not null");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 5) - 5;
        var sql_data_total = "select count(tb.id) as total from (SELECT a.id FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id LEFT JOIN pembayaran c ON a.id = c.member_id and c.tahun=? INNER JOIN server d on d.id=b.server_id " + filter_query + " GROUP BY a.id) as tb";
        var query_data_total = connection.query(sql_data_total,[tahun], function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "SELECT a.id,a.nama,a.alamat,IFNULL(a.no_wa,'') as no_wa,IFNULL(a.email,'') as email,a.ppp_secret_id,a.is_berhenti_langganan,a.bulan_berhenti_langganan,a.tahun_berhenti_langganan,a.tgl_insert,a.last_update,a.nominal_pembayaran as nominal_pembayaran,a.awal_tagihan_bulan,a.awal_tagihan_tahun,IFNULL(GROUP_CONCAT(c.bulan), '') AS bulan, IFNULL(c.tahun, '') AS tahun, b.name, b.password, b.profile,c.nominal_pembayaran as nominal_pembayaran_dibayar,d.nama as nama_server,d.host,d.port,d.user,d.password FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id LEFT JOIN pembayaran c ON a.id = c.member_id and c.tahun=? INNER JOIN server d on d.id=b.server_id " + filter_query + " GROUP BY a.id limit " + limit + ",6";
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
                          console.log(err);
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
                  var data = {is_error:false,msg:"Berhasil membatalkan pembayaran"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  connection.release();
                  var data = {is_error:true,msg:"Gagal membatalkan pembayaran"};
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
      var bulan = "";
      if(req.body.bulan != undefined){
        bulan = req.body.bulan;
      }
      var tahun = "";
      if(req.body.tahun != undefined){
        tahun = req.body.tahun;
      }
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("d.user_id=" + req.session.user_id);
        arr_query.push("((a.awal_tagihan_tahun = " + tahun + " and " + bulan + " >= a.awal_tagihan_bulan) or (" + tahun + " > a.awal_tagihan_tahun))");
        arr_query.push("(a.is_berhenti_langganan != 1 or (a.is_berhenti_langganan = 0 AND (a.tahun_berhenti_langganan = " + tahun + " and " + bulan + " < a.bulan_berhenti_langganan) or (" + tahun + " < a.awal_tagihan_tahun)))");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "select IFNULL(sum(a.nominal_pembayaran),0) as total from member a inner join ppp_secret b on a.ppp_secret_id=b.id inner join server d on d.id=b.server_id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            arr_query.push("c.bulan = " + bulan);
            if(arr_query.length > 0){
              filter_query = " where " + arr_query.join(" and ");
            }
            var sql_data_dibayar = "SELECT IFNULL(sum(c.nominal_pembayaran),0) as total FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id INNER JOIN pembayaran c ON a.id = c.member_id inner join server d on d.id=b.server_id " + filter_query;
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
  app.post(['/ajax/total_tagihan_khusus_stat.html'],(req, res) => {
    if(req.session.is_login){
      var tahun = "";
      if(req.body.tahun != undefined){
        tahun = req.body.tahun;
      }
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("d.user_id=" + req.session.user_id);
        arr_query.push("a.tahun=" + tahun);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "select IFNULL(sum(a.nominal_pembayaran),0) as total, a.bulan from pembayaran_khusus a inner join member b on a.member_id=b.id inner join ppp_secret c on b.ppp_secret_id=c.id inner join server d on d.id=c.server_id " + filter_query + " GROUP BY a.bulan";
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            arr_query.push("a.is_bayar=1");
            if(arr_query.length > 0){
              filter_query = " where " + arr_query.join(" and ");
            }
            var sql_data_dibayar = "select IFNULL(sum(a.nominal_pembayaran),0) as total, a.bulan from pembayaran_khusus a inner join member b on a.member_id=b.id inner join ppp_secret c on b.ppp_secret_id=c.id inner join server d on d.id=c.server_id " + filter_query + " GROUP BY a.bulan";
            var query_data_dibayar = connection.query(sql_data_dibayar, function (err, results_dibayar, fields) {
              if(results_dibayar.length == 0){
                connection.release();
                var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:false,data:[],data_total:results_total,data_total_dibayar:results_dibayar};
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
  app.post(['/ajax/tagihan_khusus_tambah.html'],(req, res) => {
    if(req.session.is_login){
      var member_id = "";
      if(req.body.member_id != undefined){
        member_id = req.body.member_id;
      }
      var nama = "";
      if(req.body.nama != undefined){
        nama = req.body.nama;
      }
      var bulan = "";
      if(req.body.bulan != undefined){
        bulan = req.body.bulan;
      }
      var tahun = "";
      if(req.body.tahun != undefined){
        tahun = req.body.tahun;
      }
      var nominal_pembayaran = "";
      if(req.body.nominal_pembayaran != undefined){
        nominal_pembayaran = req.body.nominal_pembayaran;
      }
      member_function.Cek_Akses_Member(req.session.user_id,req.session.parent_user_id,function(akses){
        if(akses){
          pool.getConnection(function(err, connection) {
            var sql_insert = "insert into pembayaran_khusus(member_id,nama,bulan,tahun,nominal_pembayaran) values(?,?,?,?,?)";
            var query_insert = connection.query(sql_insert,[member_id,nama,bulan,tahun,nominal_pembayaran], function (err, results, fields) {
              if(!err){
                connection.release();
                var data = {is_error:false,msg:"Berhasil menambah tagihan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:true,msg:"Gagal menambah tagihan"};
                res.send(JSON.stringify(data));
                res.end();
              }
            });
          });
        }else{
          var data = {is_error:true,msg:"Anda tidak mempunyai akses"};
          res.send(JSON.stringify(data));
          res.end();
        }
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/tagihan_khusus.html'],(req, res) => {
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
        if(tahun != ""){
          arr_query.push("a.tahun =" + tahun + "");
        }
        arr_query.push("(e.id=" + req.session.user_id + " or e.id=" + req.session.parent_user_id + ")");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 5) - 5;
        var sql_data_total = "select count(grouped.id) as total from (SELECT a.id FROM pembayaran_khusus a INNER JOIN member b ON a.member_id = b.id INNER JOIN ppp_secret c on b.ppp_secret_id=c.id INNER JOIN `server` d on c.server_id=d.id INNER JOIN `user` e on d.user_id=e.id  " + filter_query + " GROUP BY member_id) as grouped";
        var query_data_total = connection.query(sql_data_total,[tahun], function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "SELECT d.nama as nama_router,b.nama as nama_member,c.id as ppp_secret_id,d.id as server_id,GROUP_CONCAT(a.id SEPARATOR '|-|') as id,GROUP_CONCAT(a.nama SEPARATOR '|-|') as nama, GROUP_CONCAT(a.bulan SEPARATOR '|-|') as bulan, GROUP_CONCAT(a.tahun SEPARATOR '|-|') as tahun, GROUP_CONCAT(IFNULL(a.is_bayar,'') SEPARATOR '|-|') as is_bayar, GROUP_CONCAT(IFNULL(a.metode_bayar,'') SEPARATOR '|-|') as metode_bayar, GROUP_CONCAT(IFNULL(a.bank_id,'') SEPARATOR '|-|') as bank_id, GROUP_CONCAT(IFNULL(f.nama,'') SEPARATOR '|-|') as nama_bank, GROUP_CONCAT(IFNULL(a.nominal_pembayaran,'') SEPARATOR '|-|') as nominal_pembayaran, b.nama AS nama_member FROM pembayaran_khusus a INNER JOIN member b ON a.member_id = b.id INNER JOIN ppp_secret c on b.ppp_secret_id=c.id INNER JOIN `server` d on c.server_id=d.id INNER JOIN `user` e on d.user_id=e.id  LEFT JOIN bank f on a.bank_id=f.id  " + filter_query + " GROUP BY member_id limit " + limit + ",6";
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
  app.post(['/ajax/pembayaran_bayar_khusus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var is_bayar = "";
        if(req.body.is_bayar != undefined){
          is_bayar = req.body.is_bayar;
        }
        if(is_bayar == "1"){
          is_bayar = "0"
        }else{
          is_bayar = "1"
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
        if(is_bayar == "0"){
          metode_bayar = "0";
          bank_id = "0";
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
            var sql_nominal = "select * from pembayaran_khusus where id=?";
            var query_nominal = connection.query(sql_nominal,[id], function (err, results, fields) {
              if(results.length == 0){
                connection.release();
                var data = {is_error:true,msg:"Data nominal pembayaran tidak tersedia"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                var nominal_pembayaran = results[0]['nominal_pembayaran'];
                var cur_metode_bayar = results[0]['metode_bayar'];
                if(cur_metode_bayar == "3" || cur_metode_bayar == "4"){
                  connection.release();
                  var data = {is_error:true,msg:"Anda tidak diperbolehkan mengubah pembayaran ini"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  var sql = "update pembayaran_khusus set metode_bayar=?,bank_id=?,is_bayar=? where id=?";
                  var query = connection.query(sql,[metode_bayar,bank_id,is_bayar,id], function (err, results, fields) {
                    if (!err){
                      connection.release();
                      if(is_bayar == "1"){
                        var data = {is_error:false,msg:"Berhasil melakukan pembayaran"};
                        res.send(JSON.stringify(data));
                        res.end();
                      }else{
                        var data = {is_error:false,msg:"Berhasil membatalkan pembayaran"};
                        res.send(JSON.stringify(data));
                        res.end();
                      }
                    }else{
                      console.log(err);
                      connection.release();
                      var data = {is_error:true,msg:"Gagal memproses"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }
                  });
                }
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
  app.post(['/ajax/pembayaran_khusus_hapus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
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
            var sql_nominal = "select * from pembayaran_khusus where id=?";
            var query_nominal = connection.query(sql_nominal,[id], function (err, results, fields) {
              if(results.length == 0){
                connection.release();
                var data = {is_error:true,msg:"Data nominal pembayaran tidak tersedia"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                var nominal_pembayaran = results[0]['nominal_pembayaran'];
                var cur_metode_bayar = results[0]['metode_bayar'];
                if(cur_metode_bayar == "3" || cur_metode_bayar == "4"){
                  connection.release();
                  var data = {is_error:true,msg:"Anda tidak diperbolehkan mengubah pembayaran ini"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  var sql = "delete from pembayaran_khusus where id=? and is_bayar != 1";
                  var query = connection.query(sql,[id], function (err, results, fields) {
                    if (!err){
                      connection.release();
                      var data = {is_error:false,msg:"Berhasil menghapus tagihan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }else{
                      console.log(err);
                      connection.release();
                      var data = {is_error:true,msg:"Gagal menghapus tagihan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }
                  });
                }
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
