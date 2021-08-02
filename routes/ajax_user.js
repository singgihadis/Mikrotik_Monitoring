const pool = require('../db');
const crypto = require('crypto');
module.exports = function(app){
  app.post(['/ajax/user_edit.html'],(req, res) => {
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
        var user = "";
        if(req.body.user != undefined){
          user = req.body.user;
        }
        var level = "";
        if(req.body.level != undefined){
          level = req.body.level;
        }
        var sql_insert = "update user set nama=?,user=?,level=? where id=?";
        var query_insert = connection.query(sql_insert,[nama,user,level,id], function (err, results, fields) {
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
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/user_edit_password.html'],(req, res) => {
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
        var sql_insert = "update user set password=? where id=?";
        var query_insert = connection.query(sql_insert,[password,id], function (err, results, fields) {
          if (!err){
            connection.release();
            var data = {is_error:false,msg:"Berhasil mengubah password"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:true,msg:"Tidak dapat mengubah password"};
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
  app.post(['/ajax/user_hapus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var sql_insert = "delete from user where id=?";
        var query_insert = connection.query(sql_insert,[id], function (err, results, fields) {
          if (!err){
            connection.release();
            var data = {is_error:false,msg:"Berhasil menghapus"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:true,msg:"Tidak dapat menghapus"};
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
  app.post(['/ajax/user_tambah.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var user = "";
        if(req.body.user != undefined){
          user = req.body.user;
        }
        var level = "";
        if(req.body.level != undefined){
          level = req.body.level;
        }
        var password = "";
        if(req.body.password != undefined){
          password = req.body.password;
          password = crypto.createHash('sha1').update(password).digest("hex");
        }
        var sql_insert = "insert into user(nama,user,level,password) values(?,?,?,?)";
        var query_insert = connection.query(sql_insert,[nama,user,level,password], function (err, results, fields) {
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
  app.post(['/ajax/user_data.html'],(req, res) => {
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
          arr_query.push("concat(nama) like '%" + keyword + "%'");
        }
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 5) - 5;
        var query_limit = "";
        if(page != "x"){
          query_limit = " limit " + limit + ",6";
        }
        var sql_data = "select * from user " + filter_query + " order by tgl_insert desc" + query_limit;
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
