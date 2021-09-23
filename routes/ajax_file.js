const formidable = require('formidable');
var public_function = require("../function/public_function.js");
var user_function = require("../function/user_function.js");
var uniqid = require('uniqid');
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/file_data.html'],(req, res) => {
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
        var user_id = req.session.user_id;
        if(req.session.level == "2"){
          if(req.body.user_id != undefined){
            user_id = req.body.user_id;
          }
        }
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("nama like '%" + keyword + "%'");
        }
        if(user_id != ""){
          arr_query.push("user_id = '" + user_id + "'");
        }
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit_query = "";
        if(page == "x"){

        }else{
          limit_query = " limit " + ((page * 10) - 10) + ",11";
        }
        var sql_data = "select * from file " + filter_query + " order by is_mou desc,tgl_insert desc " + limit_query;
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
  app.post(['/ajax/file_edit.html'],(req, res) => {
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
        var sql_insert = "update file set nama=? where id=?";
        var query_insert = connection.query(sql_insert,[nama,id], function (err, results, fields) {
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
  app.post(['/ajax/file_tambah.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          var user_id = "";
          if(fields.hasOwnProperty("id")){
            user_id = fields.id;
          }
          var nama = "";
          if(fields.hasOwnProperty("nama")){
            nama = fields.nama;
          }
          var file = null;
          if(files.hasOwnProperty("file")){
            file = files.file;
          }
          user_function.Simpan_File("",file,function(file_name){
            var sql_insert = "insert into file(user_id,nama,file) values(?,?,?)";
            var query_insert = connection.query(sql_insert,[user_id,nama,file_name], function (err, results, fields) {
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
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/file_hapus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var sql_data = "select * from file where id=?";
        var query_data = connection.query(sql_data,[id], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data file tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var user_id = results[0]['user_id'];
            var is_mou = results[0]['is_mou'];
            var sql_delete = "delete from file where id=?";
            var query_delete = connection.query(sql_delete,[id], function (err, results, fields) {
              if (!err){
                if(is_mou == "1"){
                  var sql_delete_mou = "delete from mou where user_id=?";
                  var query_delete_mou = connection.query(sql_delete_mou,[user_id], function (err, results, fields) {
                    if (!err){
                      connection.release();
                      var data = {is_error:false,msg:"Berhasil menghapus"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }else{
                      connection.release();
                      var data = {is_error:true,msg:"Tidak dapat menghapus data MoU"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }
                  });
                }else{
                  connection.release();
                  var data = {is_error:false,msg:"Berhasil menghapus"};
                  res.send(JSON.stringify(data));
                  res.end();
                }

              }else{
                connection.release();
                var data = {is_error:true,msg:"Tidak dapat menghapus"};
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
