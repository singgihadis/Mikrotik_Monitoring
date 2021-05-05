const pool = require('../db');
const crypto = require('crypto');
const RouterOSClient = require('routeros-client').RouterOSClient;
module.exports = function(app){
  app.post(['/ajax/router_edit.html'],(req, res) => {
    if(req.session.is_login){
      var id = "";
      if(req.body.id != undefined){
        id = req.body.id;
      }
      var nama = "";
      if(req.body.nama != undefined){
        nama = req.body.nama;
      }
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
      pool.getConnection(function(err, connection) {
        var sql_cek = "select * from server where host=? and user_id != ?";
        var query_cek = connection.query(sql_cek,[host,req.session.user_id], function (err, results, fields) {
          if(results.length == 0){
            var sql_insert = "update server set nama=?,host=?,port=?,user=?,password=? where id=?";
            var query_insert = connection.query(sql_insert,[nama,host,port,user,password,id], function (err, results, fields) {
              if (!err){
                connection.release();
                var data = {is_error:false,msg:"Berhasil mengubah"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                connection.release();
                var data = {is_error:true,msg:"Tidak dapat mengubah data"};
                res.send(JSON.stringify(data));
                res.end();
              }
            });
          }else{
            connection.release();
            var data = {is_error:true,msg:"Router sudah digunakan user lain"};
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
  app.post(['/ajax/router_tambah.html'],(req, res) => {
    if(req.session.is_login){
      var nama = "";
      if(req.body.nama != undefined){
        nama = req.body.nama;
      }
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
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password
      });
      api.connect().then((client) => {
        api.close();
        pool.getConnection(function(err, connection) {
          var sql_cek = "select * from server where host=? and user_id != ?";
          var query_cek = connection.query(sql_cek,[host,req.session.user_id], function (err, results, fields) {
            if(results.length == 0){
              var sql_insert = "insert into server(nama,host,port,user,password) values(?,?,?,?,?)";
              var query_insert = connection.query(sql_insert,[nama,host,port,user,password], function (err, results, fields) {
                if (!err){
                  connection.release();
                  if(!req.session.server_id){
                    var data = {is_error:false,msg:"Berhasil menambah data"};
                    res.send(JSON.stringify(data));
                    res.end();
                  }else{
                    var data = {is_error:false,msg:"Berhasil menambah data"};
                    res.send(JSON.stringify(data));
                    res.end();
                  }
                }else{
                  connection.release();
                  var data = {is_error:true,msg:"Tidak dapat menambah data"};
                  res.send(JSON.stringify(data));
                  res.end();
                }
              });
            }else{
              connection.release();
              var data = {is_error:true,msg:"Router sudah digunakan user lain"};
              res.send(JSON.stringify(data));
              res.end();
            }
          });
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
  app.post(['/ajax/router_data.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var page = "1";
        if(req.body.page != undefined){
          page = req.body.page;
        }
        var keyword = "";
        if(req.body.keyword != undefined){
          keyword = req.body.keyword;
        }
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("concat(host,nama) like '%" + keyword + "%");
        }
        arr_query.push("user_id ='" + req.session.user_id + "'");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var query_limit = "";
        var limit = "";
        if(page == "x"){

        }else{
          limit = (page * 10) - 10;
          query_limit = " limit " + limit + ",11";
        }
        var sql_data = "select * from server " + filter_query + " order by tgl_insert desc " + query_limit;
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
  app.post(['/ajax/router_pilih.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        if(id == ""){
          req.session.server_id = "";
          req.session.host = "";
          req.session.port = "";
          req.session.user = "";
          req.session.password = "";
          req.session.save(function(err) {
            var data = {is_error:false,data:[],msg:"Berhasil memilih"};
            res.send(JSON.stringify(data));
            res.end();
          });
        }else{
          var sql_data = "select * from server where id=? and user_id=?";
          var query_data = connection.query(sql_data,[id,req.session.user_id], function (err, results, fields) {
            if(results.length == 0){
              connection.release();
              var data = {is_error:true,data:[],msg:"Router tidak ditemukan"};
              res.send(JSON.stringify(data));
              res.end();
            }else{
              connection.release();
              var data = results[0];
              var host = data['host'];
              var port = data['port'];
              var user = data['user'];
              var password = data['password'];
              const api = new RouterOSClient({
                  host: host,
                  port: port,
                  user: user,
                  password: password
              });
              api.connect().then((client) => {
                api.close();
                req.session.server_id = id;
                req.session.host = host;
                req.session.port = port;
                req.session.user = user;
                req.session.password = password;
                req.session.save(function(err) {
                  var data = {is_error:false,data:[],msg:"Berhasil memilih"};
                  res.send(JSON.stringify(data));
                  res.end();
                });
              }).catch((err) => {
                var data = {is_error:true,msg:"Router : " + err.message};
                res.send(JSON.stringify(data));
                res.end();
              });
            }
          });
        }
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
