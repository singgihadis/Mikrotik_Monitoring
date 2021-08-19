const RouterOSClient = require('routeros-client').RouterOSClient;
var ppp_function = require("../function/ppp_function.js");
var public_function = require("../function/public_function.js");
const fs = require('fs');
const pool = require('../db');
const config = require('../config');
var moment = require("moment");
var pdf = require("html-pdf");
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
        var sql_data_total = "select count(a.id) as total, count(b.id_ppp) as total_aktif from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` and b.server_id=? " + filter_query;
        var query_data_total = connection.query(sql_data_total,[req.session.server_id], function (err, results_total, fields) {
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
          }else if(is_active == "10"){
            arr_query.push("a.is_ada = 0");
          }
        }
        arr_query.push("a.server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var sql_data_total = "select count(a.id) as total from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` and a.server_id = b.server_id " + filter_query;

        var query_data_total = connection.query(sql_data_total, function (err, results_total, fields) {
          if(results_total.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var total = results_total[0]['total'];
            var sql_data = "select a.*,IF(b.id_ppp is null,0,1) as is_active,b.address as address from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` and a.server_id = b.server_id " + filter_query + " limit " + limit + ",11";
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
  app.post(['/ajax/ppp_secret_tidak_ada.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "select group_concat(a.id) as ids from ppp_secret a where a.server_id=? and is_ada=0";
        var query_data = connection.query(sql_data,[req.session.server_id], function (err, results, fields) {
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
  app.post(['/ajax/ppp_secret_hapus.html'],(req, res) => {
    if(req.session.is_login){
      var ids = "";
      if(req.body.ids != undefined){
        ids = req.body.ids;
      }
      pool.getConnection(function(err, connection) {
        var sql_data = "delete from ppp_secret where server_id=? and find_in_set(id," + ids + ") > 0 and is_ada = 0";
        var query_data = connection.query(sql_data,[req.session.server_id], function (err, results, fields) {
          if(err){
            connection.release();
            var data = {is_error:true,data:[],msg:"Tidak bisa menghapus"};
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
            pool.getConnection(function(err, connection) {
              var sql_delete = "update ppp_secret set is_ada=0 where server_id=?";
              var query_delete = connection.query(sql_delete, [server_id], function (err, results_update, fields) {
                if(err){
                  connection.release();
                  var data = {is_error:true,data:[],msg:"Gagal mengupdate ppp secret"};
                  res.send(JSON.stringify(data));
                  res.end();
                }else{
                  connection.release();
                  ppp_function.Simpan_Secret(0,server_id,result.length,result,function(){
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
  app.post(['/ajax/ppp_cetak_tidak_aktif.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data_router = "select * from server where id=?";
        var query_data_router = connection.query(sql_data_router,[req.session.server_id], function (err, results_router, fields) {
          if(results_router.length > 0){
            var nama_router = results_router[0]['nama'];
            var sql_data = "select a.*,IF(b.id_ppp is null,0,1) as is_active,b.address as address from ppp_secret a left join ppp_active_connection b on a.`name`=b.`name` and a.server_id = b.server_id where a.server_id=? and b.id_ppp is null";
            var query_data = connection.query(sql_data,[req.session.server_id], function (err, results_ppp, fields) {
              connection.release();
              var html_list = "";
              if(results_ppp.length > 0){
                var no = 1;
                results_ppp.forEach((item, i) => {
                  html_list += "<tr>";
                  html_list += "<td style='padding-left:15px;padding-top:8px;padding-bottom:8px;padding-right:8px;border: 1px solid #ddd;'>" + no + "</td>";
                  html_list += "<td style='padding-left:5px;padding-top:8px;padding-bottom:8px;padding-right:5px;border: 1px solid #ddd;'>" + item['name'] + "</td>";
                  html_list += "<td style='padding-left:5px;padding-top:8px;padding-bottom:8px;padding-right:5px;border: 1px solid #ddd;'>" + item['password'] + "</td>";
                  html_list += "<td style='padding-left:5px;padding-top:8px;padding-bottom:8px;padding-right:15px;border: 1px solid #ddd;'>" + item['profile'] + "</td>";
                  html_list += "<td style='padding-left:5px;padding-top:8px;padding-bottom:8px;padding-right:15px;border: 1px solid #ddd;'>" + item['local_address'] + "</td>";
                  html_list += "<td style='padding-left:5px;padding-top:8px;padding-bottom:8px;padding-right:15px;border: 1px solid #ddd;'>" + item['remote_address'] + "</td>";
                  html_list += "</tr>";
                  no++;
                });
              }else{
                html_list += "<tr><td colspan='6'>Data tidak data</td></tr>";
              }
              var tgl = moment().format("D") + " " + public_function.NamaBulan(moment().format("M")) + " " + moment().format("YYYY");
              var html = __dirname + '/../ppp.html';
              fs.readFile(html, 'utf8', function(err, data) {
                  if (err) throw err;
                  if (!fs.existsSync("./public/pdf/" + req.session.user_id)){
                      fs.mkdirSync("./public/pdf/" + req.session.user_id);
                  }
                  data = data.replace(/{{nama_router}}/g,nama_router);
                  data = data.replace(/{{tgl}}/g,tgl);
                  data = data.replace(/{{data_html}}/g,html_list);
                  var options = { format: 'A4' };
                  pdf.create(data,options).toStream(function(err, stream){
                    // res.setHeader('Content-disposition', 'inline; filename="invoice"');
                    // res.setHeader('Content-type', 'application/pdf');
                    // res.setHeader('Content-Type', 'application/pdf');
                    // res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf;');
                    // stream.pipe(res);
                    stream.pipe(fs.createWriteStream('./public/pdf/' + req.session.user_id + "/ppp_" + req.session.server_id + '.pdf'));
                    var data = {is_error:false,data:[],msg:"sukses",output:config['main_url'] + '/assets/pdf/' + req.session.user_id + "/ppp_" + req.session.server_id + '.pdf'};
                    res.send(JSON.stringify(data));
                    res.end();
                  });
              });
            });
          }else{
            connection.release();
            var data = {is_error:true,data:[],msg:"Data router tidak ditemukan"};
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
