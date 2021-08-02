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
          arr_query.push("(concat(a.name,a.password,a.profile,a.local_address,a.remote_address) like '%" + keyword + "%' or b.nama like '%" + keyword + "%')");
        }
        arr_query.push("c.user_id=" + req.session.user_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var sql_data_total = "select count(a.id) as total from ppp_secret a LEFT JOIN member b ON a.id = b.ppp_secret_id INNER JOIN `server` c ON a.server_id=c.id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "SELECT a.*, IFNULL(b.nama,'') as nama,IFNULL(b.alamat,'') as alamat,b.awal_tagihan_bulan,b.awal_tagihan_tahun,IFNULL(b.no_wa,'') as no_wa,IFNULL(b.email,'') as email,IFNULL(b.nominal_pembayaran,'0') as nominal_pembayaran,b.is_berhenti_langganan,b.bulan_berhenti_langganan,b.tahun_berhenti_langganan,c.nama as nama_server,c.host,c.port,c.user,c.password FROM ppp_secret a LEFT JOIN member b ON a.id = b.ppp_secret_id INNER JOIN `server` c ON a.server_id=c.id " + filter_query + " limit " + limit + ",11";
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
        arr_query.push("c.user_id=" + req.session.user_id);
        arr_query.push("a.id=" + id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "SELECT a.*, IFNULL(b.nama,'') as nama,IFNULL(b.alamat,'') as alamat,b.awal_tagihan_bulan,b.awal_tagihan_tahun,IF(d.id_ppp is null,0,1) as is_active,IFNULL(b.no_wa,'') as no_wa,IFNULL(b.email,'') as email,IFNULL(b.nominal_pembayaran,'0') as nominal_pembayaran,b.id as member_id,b.is_berhenti_langganan,b.bulan_berhenti_langganan,b.tahun_berhenti_langganan,c.host,c.port,c.user FROM ppp_secret a LEFT JOIN member b ON a.id = b.ppp_secret_id INNER JOIN `server` c ON a.server_id=c.id left join ppp_active_connection d on a.`name`=d.`name` " + filter_query + "";
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
        var sql_cek = "select * from member where ppp_secret_id=?";
        var query_cek = connection.query(sql_cek,[id], function (err, results, fields) {
          if(results.length == 0){
            var sql = "insert into member(ppp_secret_id,nama,alamat,no_wa,email,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan) values(?,?,?,?,?,?,?,?,?,?,?)";
            var query = connection.query(sql,[id,nama,alamat,no_wa,email,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan], function (err, results, fields) {
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
            var sql = "update member set nama=?,alamat=?,no_wa=?,email=?,nominal_pembayaran=?,awal_tagihan_bulan=?,awal_tagihan_tahun=?,is_berhenti_langganan=?,bulan_berhenti_langganan=?,tahun_berhenti_langganan=? where ppp_secret_id=?";
            var query = connection.query(sql,[nama,alamat,no_wa,email,nominal_pembayaran,awal_tagihan_bulan,awal_tagihan_tahun,is_berhenti_langganan,bulan_berhenti_langganan,tahun_berhenti_langganan,id], function (err, results, fields) {
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
        arr_query.push("c.user_id=" + req.session.user_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data_total = "select count(b.id) as total from member a right join ppp_secret b on a.ppp_secret_id=b.id INNER JOIN `server` c ON b.server_id=c.id " + filter_query;
        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data_dibayar = "select count(a.id) as total from member a inner join ppp_secret b on a.ppp_secret_id=b.id INNER JOIN `server` c ON b.server_id=c.id " + filter_query + " and a.awal_tagihan_bulan is not null ";
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
        var sql_data = "SELECT d.* FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id INNER JOIN `server` c ON b.server_id = c.id INNER JOIN member_traffic_data d ON a.id = d.member_id where d.tgl >= ? and d.tgl <= ? and a.id=? and c.user_id=? and c.id=?";
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
        var sql_data = "select * from pengaturan where user_id=?";
        var query_data = connection.query(sql_data,[req.session.user_id], function (err, results_pengaturan, fields) {
          if(results_pengaturan.length > 0){
            var sql_data = "select * from bank where user_id=?";
            var query_data = connection.query(sql_data,[req.session.user_id], function (err, results_bank, fields) {
              var sql_member = "select a.*,b.nama,b.alamat,b.no_wa,b.nominal_pembayaran from ppp_secret a left join member b on a.id=b.ppp_secret_id where a.id=?";
              var query_member = connection.query(sql_member,[id], function (err, results_member, fields) {
                connection.release();
                if(results_member.length > 0){
                  var logo = results_pengaturan[0]['logo'];
                  if(logo != ""){
                    logo = config['main_url'] + logo;
                  }
                  var website = results_pengaturan[0]['website'];
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
                  var no_invoice = moment().format('YYYYMMDD') + "0001";
                  var tgl = moment().format("DD") + " " + public_function.NamaBulan(moment().format("M")) + " " + moment().format("YYYY");
                  var bln_thn = public_function.NamaBulan(moment().format("M")) + " " + moment().format("YYYY");
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
}
