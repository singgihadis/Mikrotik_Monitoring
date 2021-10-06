const pool = require('../db');
const crypto = require('crypto');
const formidable = require('formidable');
var user_function = require("../function/user_function.js");
module.exports = function(app){
  app.post(['/ajax/user_edit.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          var id = "";
          if(fields.hasOwnProperty("id")){
            id = fields.id;
          }
          var nama = "";
          if(fields.hasOwnProperty("nama")){
            nama = fields.nama;
          }
          var user = "";
          if(fields.hasOwnProperty("user")){
            user = fields.user;
          }
          var level = "";
          if(fields.hasOwnProperty("level")){
            level = fields.level;
          }
          var level_user = req.session.level;
          if(level_user == "1" && level == "2"){
            connection.release();
            var data = {is_error:true,msg:"Anda tidak mempunyai akses untuk mengubah level menjadi admin"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var status = "";
            if(fields.hasOwnProperty("status")){
              status = fields.status;
            }
            var parent_user_id = "";
            if(fields.hasOwnProperty("parent_user_id")){
              parent_user_id = fields.parent_user_id;
            }
            var nik = "";
            if(fields.hasOwnProperty("nama")){
              nik = fields.nik;
            }
            var email = "";
            if(fields.hasOwnProperty("email")){
              email = fields.email;
            }
            var alamat = "";
            if(fields.hasOwnProperty("alamat")){
              alamat = fields.alamat;
            }
            var file_npwp = null;
            if(files.hasOwnProperty("file_npwp")){
              file_npwp = files.file_npwp;
            }
            var file_ktp = null;
            if(files.hasOwnProperty("file_ktp")){
              file_ktp = files.file_ktp;
            }
            var user_level = req.session.level;
            var user_id = req.session.user_id;
            var filter_query = "";
            if(user_level == "1"){
              if(user_id != id){
                filter_query = " and parent_user_id=" + user_id;
              }
            }
            var sql_data = "select * from user where id=?" + filter_query;
            var query_data = connection.query(sql_data,[id], function (err, results, fields) {
              if(results.length == 0){
                connection.release();
                var data = {is_error:true,data:[],msg:"Data yang di edit tidak ditemukan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                var cur_file_npwp = results[0]['file_npwp'];
                var cur_file_ktp = results[0]['file_ktp'];
                user_function.Simpan_Gambar(cur_file_npwp,file_npwp,function(npwp_file_name){
                  user_function.Simpan_Gambar(cur_file_ktp,file_ktp,function(ktp_file_name){
                    var sql_insert = "update user set nama=?,user=?,level=?,status=?,parent_user_id=?,nik=?,email=?,alamat=?,file_npwp=?,file_ktp=? where id=?";
                    var query_insert = connection.query(sql_insert,[nama,user,level,status,parent_user_id,nik,email,alamat,npwp_file_name,ktp_file_name,id], function (err, results, fields) {
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
                });
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
        var user_level = req.session.level;
        var user_id = req.session.user_id;
        var filter_query = "";
        if(user_level == "1"){
          if(user_id != id){
            filter_query = " and parent_user_id=" + user_id;
          }
        }
        var sql_insert = "update user set password=? where id=?" + filter_query;
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
        var user_level = req.session.level;
        var user_id = req.session.user_id;
        var filter_query = "";
        if(user_level == "1"){
          if(user_id != id){
            filter_query = " and parent_user_id=" + user_id;
          }
        }
        var sql_insert = "delete from user where id=?" + filter_query;
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
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          var nama = "";
          if(fields.hasOwnProperty("nama")){
            nama = fields.nama;
          }
          var user = "";
          if(fields.hasOwnProperty("user")){
            user = fields.user;
          }
          var password = "";
          if(fields.hasOwnProperty("password")){
            password = fields.password;
            password = crypto.createHash('sha1').update(password).digest("hex");
          }
          var level = "";
          if(fields.hasOwnProperty("level")){
            level = fields.level;
          }
          var level_user = req.session.level;
          if(level_user == "1" && level == "2"){
            connection.release();
            var data = {is_error:true,msg:"Anda tidak mempunyai akses untuk menambakan user dengan level admin"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var status = "";
            if(fields.hasOwnProperty("status")){
              status = fields.status;
            }
            var parent_user_id = "";
            if(fields.hasOwnProperty("parent_user_id")){
              parent_user_id = fields.parent_user_id;
            }
            var nik = "";
            if(fields.hasOwnProperty("nik")){
              nik = fields.nik;
            }
            var email = "";
            if(fields.hasOwnProperty("email")){
              email = fields.email;
            }
            var alamat = "";
            if(fields.hasOwnProperty("alamat")){
              alamat = fields.alamat;
            }
            var file_npwp = null;
            if(files.hasOwnProperty("file_npwp")){
              file_npwp = files.file_npwp;
            }
            var file_ktp = null;
            if(files.hasOwnProperty("file_ktp")){
              file_ktp = files.file_ktp;
            }
            user_function.Simpan_Gambar("",file_npwp,function(npwp_file_name){
              user_function.Simpan_Gambar("",file_ktp,function(ktp_file_name){
                var sql_insert = "insert into user(nama,user,level,status,password,parent_user_id,nik,email,alamat,file_npwp,file_ktp) values(?,?,?,?,?,?,?,?,?,?,?)";
                var query_insert = connection.query(sql_insert,[nama,user,level,status,password,parent_user_id,nik,email,alamat,npwp_file_name,ktp_file_name], function (err, results, fields) {
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
        var level = "";
        if(req.body.level != undefined){
          level = req.body.level;
        }
        var level_user = req.session.level;
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("concat(nama) like '%" + keyword + "%'");
        }
        if(level != ""){
          arr_query.push("level = " + level + "");
        }
        if(level_user == "2"){

        }else if(level_user == "1"){
          var user_id = req.session.user_id;
          var parent_user_id = req.session.parent_user_id;
          var arr_query_user_id = [];
          arr_query_user_id.push("id = " + user_id);
          arr_query_user_id.push("parent_user_id = " + user_id);
          arr_query.push("(" + arr_query_user_id.join(" or ") + ")");
        }
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit = (page * 10) - 10;
        var query_limit = "";
        if(page != "x"){
          query_limit = " limit " + limit + ",11";
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
