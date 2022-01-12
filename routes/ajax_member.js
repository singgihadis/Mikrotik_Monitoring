const RouterOSClient = require('routeros-client').RouterOSClient;
const fs = require('fs');
var ppp_function = require("../function/ppp_function.js");
var public_function = require("../function/public_function.js");
var moment = require("moment");
const pool = require('../db');
const config = require('../config');
var pdf = require("html-pdf");
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
          arr_query.push("(concat(a.name,b.nama) like '%" + keyword + "%')");
        }
        arr_query.push("(c.user_id=" + req.session.user_id + " or c.user_id=" + req.session.parent_user_id + ")");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        // var sql_data_total = "SELECT count(a.type) as total FROM ( SELECT id as ppp_secret_id, null as simple_queue_id, NAME AS NAME, server_id, 1 AS type FROM ppp_secret UNION SELECT null as ppp_secret_id, id as simple_queue_id, NAME AS NAME, server_id, 2 FROM simple_queue ) AS a LEFT JOIN member b ON a.ppp_secret_id = b.ppp_secret_id OR a.simple_queue_id = b.simple_queue_id INNER JOIN `server` c ON a.server_id = c.id OR a.server_id = c.id " + filter_query;
        var sql_data_total = "SELECT count(a.type) as total FROM ( SELECT id as ppp_secret_id, null as simple_queue_id, NAME AS NAME, server_id, 1 AS type FROM ppp_secret) AS a LEFT JOIN member b ON a.ppp_secret_id = b.ppp_secret_id OR a.simple_queue_id = b.simple_queue_id INNER JOIN `server` c ON a.server_id = c.id OR a.server_id = c.id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            // var sql_data = "SELECT a.type, a.ppp_secret_id, a.simple_queue_id, a.server_id, a.NAME AS resource_name, IFNULL(b.simple_queue_username,'') as simple_queue_username, IFNULL(b.simple_queue_password,'') as simple_queue_password, IFNULL(b.nama, '')AS nama, IFNULL(b.alamat, '') AS alamat, b.awal_tagihan_bulan, b.awal_tagihan_tahun, IFNULL(b.no_wa, '')AS no_wa, IFNULL(b.email, '')AS email, IFNULL(b.nominal_pembayaran, '0')AS nominal_pembayaran, b.is_berhenti_langganan, b.bulan_berhenti_langganan, b.tahun_berhenti_langganan, b.master_paket_id, c.nama AS nama_server, c.`host`, c.`port`, c.`port`, c.`password` FROM ( SELECT id as ppp_secret_id, null as simple_queue_id, NAME AS NAME, server_id, 1 AS type FROM ppp_secret )AS a LEFT JOIN member b ON a.ppp_secret_id = b.ppp_secret_id OR a.simple_queue_id = b.simple_queue_id INNER JOIN `server` c ON a.server_id = c.id OR a.server_id = c.id " + filter_query + " limit " + limit + ",11";

            var sql_data = "SELECT a.type, a.ppp_secret_id, a.simple_queue_id, a.server_id, a.name AS resource_name, a.profile, IFNULL(b.simple_queue_username, '')AS simple_queue_username, IFNULL(b.simple_queue_password, '')AS simple_queue_password, IFNULL(b.nama, '')AS nama, IFNULL(b.alamat, '')AS alamat, b.awal_tagihan_bulan, b.awal_tagihan_tahun, IFNULL(b.no_wa, '')AS no_wa, IFNULL(b.email, '')AS email, IFNULL(b.nominal_pembayaran, '0')AS nominal_pembayaran, b.is_berhenti_langganan, b.bulan_berhenti_langganan, b.tahun_berhenti_langganan, b.master_paket_id, c.nama AS nama_server, c.`host`, c.`port`, c.`port`, c.`password` FROM( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, NAME AS NAME, server_id, 1 AS type, `profile` FROM ppp_secret)AS a LEFT JOIN member b ON a.ppp_secret_id = b.ppp_secret_id OR a.simple_queue_id = b.simple_queue_id INNER JOIN `server` c ON a.server_id = c.id OR a.server_id = c.id " + filter_query + " order by b.nama asc limit " + limit + ",11";
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
        arr_query.push("(c.user_id=" + req.session.user_id + " or c.user_id=" + req.session.parent_user_id + ")");
        arr_query.push("(a.ppp_secret_id = " + id + " or a.simple_queue_id=" + id + ")");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "SELECT a.*, IFNULL(b.nama, '')AS nama, IFNULL(b.alamat, '')AS alamat, b.awal_tagihan_bulan, b.awal_tagihan_tahun, IF(d.id_ppp IS NULL, 0, 1)AS is_active, IFNULL(b.no_wa, '')AS no_wa, IFNULL(b.email, '')AS email, IFNULL(b.nominal_pembayaran, '0')AS nominal_pembayaran, b.id AS member_id, b.is_berhenti_langganan, b.bulan_berhenti_langganan, b.tahun_berhenti_langganan, b.simple_queue_username, b.simple_queue_password, c. HOST, c. PORT, c. USER FROM ( SELECT id as ppp_secret_id, null as simple_queue_id, name, password, server_id, profile, remote_address, null as target, null as upload_max_limit, null as download_max_limit, 1 AS type FROM ppp_secret UNION SELECT null as ppp_secret_id, id as simple_queue_id, name, null as password, server_id, null as profile, null as remote_address, target, upload_max_limit, download_max_limit, 2 FROM simple_queue )AS a LEFT JOIN member b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN `server` c ON a.server_id = c.id LEFT JOIN ppp_active_connection d ON a.`name` = d.`name` " + filter_query + "";
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
        var email = "";
        if(req.body.email != undefined){
          email = req.body.email;
        }
        var nominal_pembayaran = "";
        if(req.body.nominal_pembayaran != undefined){
          nominal_pembayaran = req.body.nominal_pembayaran;
        }
        var awal_tagihan_bulan = "";
        if(req.body.awal_tagihan_bulan != undefined){
          awal_tagihan_bulan = req.body.awal_tagihan_bulan;
        }
        var awal_tagihan_tahun = "";
        if(req.body.awal_tagihan_tahun != undefined){
          awal_tagihan_tahun = req.body.awal_tagihan_tahun;
        }
        var is_berhenti_langganan = "";
        if(req.body.is_berhenti_langganan != undefined){
          is_berhenti_langganan = req.body.is_berhenti_langganan;
        }
        var bulan_berhenti_langganan = "";
        if(req.body.bulan_berhenti_langganan != undefined){
          bulan_berhenti_langganan = req.body.bulan_berhenti_langganan;
        }
        var tahun_berhenti_langganan = "";
        if(req.body.tahun_berhenti_langganan != undefined){
          tahun_berhenti_langganan = req.body.tahun_berhenti_langganan;
        }
        var master_paket_id = "";
        if(req.body.master_paket_id != undefined){
          master_paket_id = req.body.master_paket_id;
        }
        var sql_cek_akses = "select a.* from ppp_secret a inner join server b on a.server_id=b.id where a.id=? and b.user_id=?";
        var query_cek_akses = connection.query(sql_cek_akses,[id,req.session.user_id], function (err, results, fields) {
          if(results.length > 0 || req.session.level == 2){
            var sql_cek = "select * from member where ppp_secret_id=?";
            var query_cek = connection.query(sql_cek,[id], function (err, results, fields) {
              if(results.length == 0){
                var sql = "insert into member(ppp_secret_id,nama,alamat,no_wa,email,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,master_paket_id) values(?,?,?,?,?,?,?,?,?,?,?,?)";
                var query = connection.query(sql,[id,nama,alamat,no_wa,email,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,master_paket_id], function (err, results, fields) {
                  if (!err){
                    var member_id = results.insertId;
                    var sql_update_indicator = "update live_indicator_data set value='1' where id=1";
                    var query_update_indicator = connection.query(sql_update_indicator, function (err, results, fields) {
                      var sql_log = "insert into member_nominal_pembayaran_log(user_id,member_id,nominal_pembayaran,deskripsi) values(?,?,?,?)";
                      var query_log = connection.query(sql_log,[req.session.user_id,member_id,nominal_pembayaran,"Set baru nominal pembayaran Rp. " + public_function.FormatAngka(nominal_pembayaran)], function (err, results, fields) {
                        connection.release();
                        var data = {is_error:false,msg:"Berhasil menyimpan"};
                        res.send(JSON.stringify(data));
                        res.end();
                      });
                    });
                  }else{
                    connection.release();
                    var data = {is_error:true,msg:"Gagal menyimpan"};
                    res.send(JSON.stringify(data));
                    res.end();
                  }
                });
              }else{
                var last_nominal_pembayaran = results[0]['nominal_pembayaran'];
                var member_id = results[0]['id'];
                var sql = "update member set nama=?,alamat=?,no_wa=?,email=?,nominal_pembayaran=?,awal_tagihan_bulan=?,awal_tagihan_tahun=?,is_berhenti_langganan=?,bulan_berhenti_langganan=?,tahun_berhenti_langganan=?,master_paket_id=? where ppp_secret_id=?";
                var query = connection.query(sql,[nama,alamat,no_wa,email,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,master_paket_id,id], function (err, results, fields) {
                  if (!err){
                    var sql_update_indicator = "update live_indicator_data set value='1' where id=1";
                    var query_update_indicator = connection.query(sql_update_indicator, function (err, results, fields) {
                      if(nominal_pembayaran == last_nominal_pembayaran){
                        connection.release();
                        var data = {is_error:false,msg:"Berhasil menyimpan"};
                        res.send(JSON.stringify(data));
                        res.end();
                      }else{
                        var sql_log = "insert into member_nominal_pembayaran_log(user_id,member_id,nominal_pembayaran,deskripsi) values(?,?,?,?)";
                        var query_log = connection.query(sql_log,[req.session.user_id,member_id,nominal_pembayaran,"Update nominal pembayaran Rp. " + public_function.FormatAngka(last_nominal_pembayaran) + " menjadi Rp. " + public_function.FormatAngka(nominal_pembayaran)], function (err, results, fields) {
                          connection.release();
                          var data = {is_error:false,msg:"Berhasil menyimpan"};
                          res.send(JSON.stringify(data));
                          res.end();
                        });
                      }
                    });
                  }else{
                    connection.release();
                    var data = {is_error:true,msg:"Gagal menyimpan"};
                    res.send(JSON.stringify(data));
                    res.end();
                  }
                });
              }
            });
          }else{
            connection.release();
            var data = {is_error:true,msg:"Anda tidak mempunyai akses"};
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
  app.post(['/ajax/member_simpan_sq.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var simple_queue_id = "";
        if(req.body.simple_queue_id != undefined){
          simple_queue_id = req.body.simple_queue_id;
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
        var email = "";
        if(req.body.email != undefined){
          email = req.body.email;
        }
        var username = "";
        if(req.body.username != undefined){
          username = req.body.username;
        }
        var password = "";
        if(req.body.password != undefined){
          password = req.body.password;
        }
        var nominal_pembayaran = "";
        if(req.body.nominal_pembayaran != undefined){
          nominal_pembayaran = req.body.nominal_pembayaran;
        }
        var awal_tagihan_bulan = "";
        if(req.body.awal_tagihan_bulan != undefined){
          awal_tagihan_bulan = req.body.awal_tagihan_bulan;
        }
        var awal_tagihan_tahun = "";
        if(req.body.awal_tagihan_tahun != undefined){
          awal_tagihan_tahun = req.body.awal_tagihan_tahun;
        }
        var is_berhenti_langganan = "";
        if(req.body.is_berhenti_langganan != undefined){
          is_berhenti_langganan = req.body.is_berhenti_langganan;
        }
        var bulan_berhenti_langganan = "";
        if(req.body.bulan_berhenti_langganan != undefined){
          bulan_berhenti_langganan = req.body.bulan_berhenti_langganan;
        }
        var tahun_berhenti_langganan = "";
        if(req.body.tahun_berhenti_langganan != undefined){
          tahun_berhenti_langganan = req.body.tahun_berhenti_langganan;
        }
        var master_paket_id = "";
        if(req.body.master_paket_id != undefined){
          master_paket_id = req.body.master_paket_id;
        }
        var sql_cek_akses = "select a.* from simple_queue a inner join server b on a.server_id=b.id where a.id=? and b.user_id=?";
        var query_cek_akses = connection.query(sql_cek_akses,[simple_queue_id,req.session.user_id], function (err, results, fields) {
          if(results.length > 0 || req.session.level == 2){
            var sql_cek = "select * from member where simple_queue_id=?";
            var query_cek = connection.query(sql_cek,[simple_queue_id], function (err, results, fields) {
              if(results.length == 0){
                var sql = "insert into member(simple_queue_id,nama,alamat,no_wa,email,simple_queue_username,simple_queue_password,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,master_paket_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                var query = connection.query(sql,[simple_queue_id,nama,alamat,no_wa,email,username,password,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,master_paket_id], function (err, results, fields) {
                  if (!err){
                    var member_id = results.insertId;
                    var sql_log = "insert into member_nominal_pembayaran_log(user_id,member_id,nominal_pembayaran,deskripsi) values(?,?,?,?)";
                    var query_log = connection.query(sql_log,[req.session.user_id,member_id,nominal_pembayaran,"Set baru nominal pembayaran Rp. " + public_function.FormatAngka(nominal_pembayaran)], function (err, results, fields) {
                      connection.release();
                      var data = {is_error:false,msg:"Berhasil menyimpan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    });
                  }else{
                    console.log(err);
                    connection.release();
                    var data = {is_error:true,msg:"Gagal menyimpan"};
                    res.send(JSON.stringify(data));
                    res.end();
                  }
                });
              }else{
                var last_nominal_pembayaran = results[0]['nominal_pembayaran'];
                var member_id = results[0]['id'];
                var sql = "update member set nama=?,alamat=?,no_wa=?,email=?,simple_queue_username=?,simple_queue_password=?,nominal_pembayaran=?,awal_tagihan_bulan=?,awal_tagihan_tahun=?,is_berhenti_langganan=?,bulan_berhenti_langganan=?,tahun_berhenti_langganan=?,master_paket_id=? where simple_queue_id=?";
                var query = connection.query(sql,[nama,alamat,no_wa,email,username,password,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,master_paket_id,simple_queue_id], function (err, results, fields) {
                  if (!err){
                    if(nominal_pembayaran == last_nominal_pembayaran){
                      connection.release();
                      var data = {is_error:false,msg:"Berhasil menyimpan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }else{
                      var sql_log = "insert into member_nominal_pembayaran_log(user_id,member_id,nominal_pembayaran,deskripsi) values(?,?,?,?)";
                      var query_log = connection.query(sql_log,[req.session.user_id,member_id,nominal_pembayaran,"Update nominal pembayaran Rp. " + public_function.FormatAngka(last_nominal_pembayaran) + " menjadi Rp. " + public_function.FormatAngka(nominal_pembayaran)], function (err, results, fields) {
                        connection.release();
                        var data = {is_error:false,msg:"Berhasil menyimpan"};
                        res.send(JSON.stringify(data));
                        res.end();
                      });
                    }
                  }else{
                    console.log(err);
                    connection.release();
                    var data = {is_error:true,msg:"Gagal menyimpan"};
                    res.send(JSON.stringify(data));
                    res.end();
                  }
                });
              }
            });
          }else{
            connection.release();
            var data = {is_error:true,msg:"Anda tidak mempunyai akses"};
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
  app.post(['/ajax/total_member.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("c.user_id=" + req.session.user_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "SELECT count(b.id) AS total FROM member a RIGHT JOIN ( SELECT id as id,id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT id as id,NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue ) AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN `server` c ON b.server_id = c.id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data_dibayar = "SELECT count(a.id) AS total FROM member a INNER JOIN ( SELECT id as id,id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT id as id,NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue ) AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id = b.simple_queue_id INNER JOIN `server` c ON b.server_id = c.id " + filter_query + " and a.awal_tagihan_bulan is not null ";
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
      var server_id = "";
      if(req.body.server_id != undefined){
        server_id = req.body.server_id;
      }
      var user_id = req.session.user_id;
      pool.getConnection(function(err, connection) {
        var sql_data = "SELECT * from server where user_id=? and id=?";
        var query_data = connection.query(sql_data,[req.session.user_id,server_id], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Router tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var host = results[0]['host'];
            var port = results[0]['port'];
            var user = results[0]['user'];
            var password = results[0]['password'];
            const api = new RouterOSClient({
                host: host,
                port: port,
                user: user,
                password: password,
                keepalive: true
            });
            api.connect().then((client) => {
              var torch = client.menu("/interface monitor-traffic").where({interface:"<pppoe-" + name + ">"}).stream((err, data_traffic, stream) => {
                  if (err){
                    var data = {is_error:true,data:[],msg:"Tidak bisa mengambil data interface monitor-traffic, silahkan upgrade versi ROS anda"};
                    torch.stop();
                    api.close();
                    res.send(JSON.stringify(data));
                    res.end();
                  }else{
                    var data = {is_error:false,data:data_traffic,msg:""};
                    torch.stop();
                    api.close();
                    res.send(JSON.stringify(data));
                    res.end();
                  }
              });
            }).catch((err) => {
              var data = {is_error:true,msg:err.message};
              res.send(JSON.stringify(data));
              res.end();
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
  app.post(['/ajax/get_traffic_data_service.html'],(req, res) => {
    var host = "";
    if(req.body.host != undefined){
      host = req.body.host;
    }
    var port = "";
    if(req.body.port != undefined){
      port = req.body.port;
    }
    var user = "";
    if(req.body.user != undefined){
      user = req.body.user;
    }
    var password = "";
    if(req.body.password != undefined){
      password = req.body.password;
    }
    var name = "";
    if(req.body.name != undefined){
      name = req.body.name;
    }
    const api = new RouterOSClient({
        host: host,
        port: port,
        user: user,
        password: password
    });
    api.connect().then((client) => {
      var torch = client.menu("/interface monitor-traffic").where({interface:"<pppoe-" + name + ">"}).stream((err, get_data, stream) => {
          try{
            if(get_data != null){
              var data = get_data[0];
              if(data != undefined){
                var sekarang = moment().unix();
                var tx = "";
                if(data.hasOwnProperty("txBitsPerSecond")){
                  tx = data['txBitsPerSecond'];
                }
                var rx = "";
                if(data.hasOwnProperty("rxBitsPerSecond")){
                  rx = data['rxBitsPerSecond'];
                }
                torch.stop();
                if(api['rosApi']['closing'] == false){
                  api.close();
                }
                var output = {
                  is_error:false,
                  data:{
                    sekarang:sekarang,
                    tx:tx,
                    rx:rx
                  }
                };
                if(res.headersSent == false){
                  res.send(JSON.stringify(output));
                  res.end();
                }
              }else{
                torch.stop();
                if(api['rosApi']['closing'] == false){
                  api.close();
                }
                var output = {is_error:true,data:{}};
                if(res.headersSent == false){
                  res.send(JSON.stringify(output));
                  res.end();
                }
              }
            }else{
              torch.stop();
              if(api['rosApi']['closing'] == false){
                api.close();
              }
              var output = {is_error:true,data:{}};
              if(res.headersSent == false){
                res.send(JSON.stringify(output));
                res.end();
              }
            }
          }catch(err){
            torch.stop();
            if(api['rosApi']['closing'] == false){
              api.close();
            }
            var output = {is_error:true,data:{}};
            if(res.headersSent == false){
              res.send(JSON.stringify(output));
              res.end();
            }
          }
      });
    }).catch((err) => {
      var output = {is_error:true,data:{}};
      if(res.headersSent == false){
        res.send(JSON.stringify(output));
        res.end();
      }
    });
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
        var server_id = "";
        if(req.body.server_id != undefined){
          server_id = req.body.server_id;
        }
        var sql_data = "SELECT d.* FROM member a INNER JOIN ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue )AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN `server` c ON b.server_id = c.id INNER JOIN member_traffic_data d ON a.id = d.member_id where d.tgl >= ? and d.tgl <= ? and a.id=? and c.user_id=? and c.id=?";
        var query_data = connection.query(sql_data,[tgl_start,tgl_end,member_id,req.session.user_id,server_id], function (err, results, fields) {
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
  app.post(['/ajax/member_cetak_invoice.html'],(req, res) => {
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
        var sql_data = "select * from pengaturan where user_id=?";
        var query_data = connection.query(sql_data,[req.session.user_id], function (err, results_pengaturan, fields) {
          if(results_pengaturan.length > 0){
            var sql_data = "select * from bank where user_id=?";
            var query_data = connection.query(sql_data,[req.session.user_id], function (err, results_bank, fields) {
              var sql_member = "SELECT a.*, b.nama, b.alamat, b.no_wa, b.nominal_pembayaran, b.id AS member_id FROM ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue ) AS a LEFT JOIN member b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id where a.id=?";
              var query_member = connection.query(sql_member,[id], function (err, results_member, fields) {
                connection.release();
                if(results_member.length > 0){
                  var logo = results_pengaturan[0]['logo'];
                  if(logo != ""){
                    logo = config['main_url'] + logo;
                  }
                  var website = results_pengaturan[0]['website'];
                  var member_id = results_member[0]['member_id'];
                  var email = results_pengaturan[0]['email'];
                  var no_wa = results_pengaturan[0]['no_wa'];
                  var nama_member = results_member[0]['nama'];
                  if(nama_member == null){
                    nama_member = "-";
                  }
                  var alamat_member = results_member[0]['alamat'];
                  if(alamat_member == null){
                    alamat_member = "-";
                  }
                  var nominal_pembayaran = results_member[0]['nominal_pembayaran'];
                  if(nominal_pembayaran != ""){
                    nominal_pembayaran = "Rp. " + public_function.FormatAngka(nominal_pembayaran);
                  }
                  var no_invoice = tahun + (bulan.toString().length==1?"0" + bulan:bulan) + moment().format('DD') + member_id + "0001";
                  var tgl = "01 " + public_function.NamaBulan(bulan) + " " + moment().format("YYYY");
                  var bln_thn = public_function.NamaBulan(bulan) + " " + moment().format("YYYY");
                  var html_bank = "";
                  if(results_bank.length > 0){
                    html_bank += "<h4 style='margin-bottom:10px;'>TRANSFER BANK</h4>";
                    results_bank.forEach((item, i) => {
                      html_bank += "<div style='margin-bottom:8px;'>" + item['nama'] + " - " + item['no_rekening'] + "</div>";
                    });
                  }
                  var html = __dirname + '/../invoice.html';
                  fs.readFile(html, 'utf8', function(err, data) {
                      if (err) throw err;
                      if (!fs.existsSync("./public/pdf/" + req.session.user_id)){
                          fs.mkdirSync("./public/pdf/" + req.session.user_id);
                      }
                      data = data.replace(/{{logo}}/g,logo);
                      data = data.replace(/{{html_bank}}/g,html_bank);
                      data = data.replace(/{{website}}/g,website);
                      data = data.replace(/{{no_wa}}/g,no_wa);
                      data = data.replace(/{{email}}/g,email);
                      data = data.replace(/{{nama_member}}/g,nama_member);
                      data = data.replace(/{{alamat_member}}/g,alamat_member);
                      data = data.replace(/{{nominal_pembayaran}}/g,nominal_pembayaran);
                      data = data.replace(/{{no_invoice}}/g,no_invoice);
                      data = data.replace(/{{tgl}}/g,tgl);
                      data = data.replace(/{{bln_thn}}/g,bln_thn);
                      var options = { format: 'A6' };
                      pdf.create(data,options).toStream(function(err, stream){
                        // res.setHeader('Content-disposition', 'inline; filename="invoice"');
                        // res.setHeader('Content-type', 'application/pdf');
                        // res.setHeader('Content-Type', 'application/pdf');
                        // res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf;');
                        // stream.pipe(res);
                        stream.pipe(fs.createWriteStream('./public/pdf/' + req.session.user_id + "/" + id + '.pdf'));
                        var data = {is_error:false,data:[],msg:"sukses",output:config['main_url'] + '/assets/pdf/' + req.session.user_id + "/" + id + '.pdf'};
                        res.send(JSON.stringify(data));
                        res.end();
                      });
                  });
                }else{
                  connection.release();
                  var data = {is_error:true,data:[],msg:"Data member tidak tersedia"};
                  res.send(JSON.stringify(data));
                  res.end();
                }
              });
            });
          }else{
            connection.release();
            var data = {is_error:true,data:[],msg:"Silahkan lengkapi data pengaturan terlebih dahulu"};
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
  app.post(['/ajax/member_inventaris_alat_data.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var ppp_secret_id = "";
        if(req.body.ppp_secret_id != undefined){
          ppp_secret_id = req.body.ppp_secret_id;
        }
        var page = "";
        if(req.body.page != undefined){
          page = req.body.page;
        }
        var limit_start = (page * 10) - 10;
        var limit = limit_start + ",11";
        var arr_query = [];
        arr_query.push("c.user_id=" + req.session.user_id);
        arr_query.push("(a.ppp_secret_id=" + ppp_secret_id + " or a.simple_queue_id=" + ppp_secret_id + ")");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_count = "SELECT count(a.id)AS total FROM inventaris_alat a INNER JOIN ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue )AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN SERVER c ON b.server_id = c.id " + filter_query + "";
        var query_count = connection.query(sql_count, function (err, results, fields) {
          var total = 0;
          if(results.length > 0){
            total = results[0]['total'];
          }
          var sql_data = "SELECT a.* FROM inventaris_alat a INNER JOIN ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue )AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN SERVER c ON b.server_id = c.id " + filter_query + " limit " + limit;
          var query_data = connection.query(sql_data, function (err, results, fields) {
            if(results.length == 0){
              connection.release();
              var data = {is_error:true,data:[],msg:"Data tidak ditemukan",total:total};
              res.send(JSON.stringify(data));
              res.end();
            }else{
              connection.release();
              var data = {is_error:false,data:results,total:total};
              res.send(JSON.stringify(data));
              res.end();
            }
          });
        });
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/member_inventaris_alat_tambah.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var type = "";
        if(req.body.type != undefined){
          type = req.body.type;
        }
        var ppp_secret_id = "";
        if(req.body.ppp_secret_id != undefined){
          ppp_secret_id = req.body.ppp_secret_id;
        }
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var serial_number = "";
        if(req.body.serial_number != undefined){
          serial_number = req.body.serial_number;
        }
        var merek = "";
        if(req.body.merek != undefined){
          merek = req.body.merek;
        }
        var tgl_pasang = "";
        if(req.body.tgl_pasang != undefined){
          tgl_pasang = req.body.tgl_pasang;
        }
        var filter_table = "ppp_secret";
        var filter_field = "ppp_secret_id";
        if(type == "2"){
          filter_table = "simple_queue";
          filter_field = "simple_queue_id";
        }
        var sql_cek_akses = "select a.* from " + filter_table + " a inner join server b on a.server_id=b.id where a.id=? and b.user_id=?";
        var query_cek_akses = connection.query(sql_cek_akses,[ppp_secret_id,req.session.user_id], function (err, results, fields) {
          if(results.length > 0 || req.session.level == 2){
            var sql_insert = "insert into inventaris_alat(" + filter_field + ",nama,serial_number,merek,tgl_pasang) values(?,?,?,?,?)";
            var query_data = connection.query(sql_insert,[ppp_secret_id,nama,serial_number,merek,tgl_pasang], function (err, results, fields) {
              if(err){
                connection.release();
                var data = {is_error:true,data:[],msg:"Gagal menambah data"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:false,data:[],msg:"Berhasil menambah data"};
                res.send(JSON.stringify(data));
                res.end();
              }
            });
          }else{
            connection.release();
            var data = {is_error:true,data:[],msg:"Anda tidak mempunyai akses"};
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
  app.post(['/ajax/member_inventaris_alat_edit.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var type = "";
        if(req.body.type != undefined){
          type = req.body.type;
        }
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var ppp_secret_id = "";
        if(req.body.ppp_secret_id != undefined){
          ppp_secret_id = req.body.ppp_secret_id;
        }
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var serial_number = "";
        if(req.body.serial_number != undefined){
          serial_number = req.body.serial_number;
        }
        var merek = "";
        if(req.body.merek != undefined){
          merek = req.body.merek;
        }
        var tgl_pasang = "";
        if(req.body.tgl_pasang != undefined){
          tgl_pasang = req.body.tgl_pasang;
        }
        var filter_table = "ppp_secret";
        var filter_field = "ppp_secret_id";
        if(type == "2"){
          filter_table = "simple_queue";
          filter_field = "simple_queue_id";
        }
        var sql_cek_akses = "select a.* from " + filter_table + " a inner join server b on a.server_id=b.id where a.id=? and b.user_id=?";
        var query_cek_akses = connection.query(sql_cek_akses,[ppp_secret_id,req.session.user_id], function (err, results, fields) {
          if(results.length > 0 || req.session.level == 2){
            var sql_insert = "update  inventaris_alat set nama=?,serial_number=?,merek=?,tgl_pasang=? where " + filter_field + "=? and id=?";
            var query_data = connection.query(sql_insert,[nama,serial_number,merek,tgl_pasang,ppp_secret_id,id], function (err, results, fields) {
              if(err){
                connection.release();
                var data = {is_error:true,data:[],msg:"Gagal mengubah data"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:false,data:[],msg:"Berhasil mengubah data"};
                res.send(JSON.stringify(data));
                res.end();
              }
            });
          }else{
            connection.release();
            var data = {is_error:true,data:[],msg:"Anda tidak mempunyai akses"};
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
  app.post(['/ajax/member_inventaris_alat_hapus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var type = "";
        if(req.body.type != undefined){
          type = req.body.type;
        }
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var ppp_secret_id = "";
        if(req.body.ppp_secret_id != undefined){
          ppp_secret_id = req.body.ppp_secret_id;
        }
        var filter_table = "ppp_secret";
        var filter_field = "ppp_secret_id";
        if(type == "2"){
          filter_table = "simple_queue";
          filter_field = "simple_queue_id";
        }
        var sql_cek_akses = "select a.* from " + filter_table + " a inner join server b on a.server_id=b.id where a.id=? and b.user_id=?";
        var query_cek_akses = connection.query(sql_cek_akses,[ppp_secret_id,req.session.user_id], function (err, results, fields) {
          if(results.length > 0 || req.session.level == 2){
            var sql_insert = "delete from inventaris_alat where " + filter_field + "=? and id=?";
            var query_data = connection.query(sql_insert,[ppp_secret_id,id], function (err, results, fields) {
              if(err){
                connection.release();
                var data = {is_error:true,data:[],msg:"Gagal menghapus data"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:false,data:[],msg:"Berhasil menghapus data"};
                res.send(JSON.stringify(data));
                res.end();
              }
            });
          }else{
            connection.release();
            var data = {is_error:true,data:[],msg:"Anda tidak mempunyai akses"};
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
