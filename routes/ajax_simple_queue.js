const RouterOSClient = require('routeros-client').RouterOSClient;
var public_function = require("../function/public_function.js");
var simple_queue_function = require("../function/simple_queue_function.js");
const pool = require('../db');
const config = require('../config');
var moment = require("moment");
module.exports = function(app){
  app.post(['/ajax/simple_queue.html'],(req, res) => {
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
          arr_query.push("(concat(a.name,a.target) like '%" + keyword + "%')");
        }
        arr_query.push("a.server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var limit_query = "";
        if(page != "x"){
          limit_query = " limit " + limit + ",11";
        }
        var sql_count = "select count(a.id) as total from simple_queue a " + filter_query + "";
        var query_count = connection.query(sql_count, function (err, results_total, fields) {
          var total = 0;
          if(results_total.length > 0){
            total = results_total[0]['total'];
          }
          var sql_data = "select a.*, IFNULL(b.nama,'') as nama from simple_queue a left join member b on a.id=b.simple_queue_id  " + filter_query + limit_query;
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
  app.post(['/ajax/simple_queue_simpan.html'],(req, res) => {
    if(req.session.is_login){
      try{
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
          client.menu("/queue simple").get().then((result) => {
              var server_id = req.session.server_id;
              api.close();
              simple_queue_function.Simpan_Simple_Queue(0,server_id,result.length,result,function(){
                var data = {is_error:false,data:[],msg:"Berhasil"};
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
      }catch(err){
        var data = {is_error:true,data:[],msg:"Koneksi timeout, silahkan refresh"};
        res.send(JSON.stringify(data));
        res.end();
      }
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/dropdown_simple_queue_for_member.html'],(req, res) => {
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
          arr_query.push("(concat(a.name,a.target) like '%" + keyword + "%')");
        }
        arr_query.push("b.id is null");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "select a.* from simple_queue a left join member b on a.id=b.simple_queue_id " + filter_query;
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
}
