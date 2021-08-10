const formidable = require('formidable');
var public_function = require("../function/public_function.js");
var uniqid = require('uniqid');
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/master_paket_data.html'],(req, res) => {
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
          arr_query.push("nama like '%" + keyword + "%'");
        }
        arr_query.push("(user_id=" + req.session.user_id + " or user_id=" + req.session.parent_user_id + ")");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit_query = "";
        if(page == "x"){

        }else{
          limit_query = " limit " + ((page * 10) - 10) + ",11";
        }
        var sql_data = "select * from master_paket " + filter_query + " order by tgl_insert desc" + limit_query;
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
  app.post(['/ajax/master_paket_edit.html'],(req, res) => {
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
        var kapasitas = "";
        if(req.body.kapasitas != undefined){
          kapasitas = req.body.kapasitas;
        }
        var harga = "";
        if(req.body.harga != undefined){
          harga = req.body.harga;
        }
        var sql_insert = "update master_paket set nama=?,kapasitas=?,harga=? where id=? and user_id=?";
        var query_insert = connection.query(sql_insert,[nama,kapasitas,harga,id,req.session.user_id], function (err, results, fields) {
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
  app.post(['/ajax/master_paket_tambah.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var kapasitas = "";
        if(req.body.kapasitas != undefined){
          kapasitas = req.body.kapasitas;
        }
        var harga = "";
        if(req.body.harga != undefined){
          harga = req.body.harga;
        }
        var sql_insert = "insert into master_paket(user_id,nama,kapasitas,harga) values(?,?,?,?)";
        var query_insert = connection.query(sql_insert,[req.session.user_id,nama,kapasitas,harga], function (err, results, fields) {
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
  app.post(['/ajax/master_paket_hapus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var sql_insert = "delete from master_paket where id=? and user_id=?";
        var query_insert = connection.query(sql_insert,[id,req.session.user_id], function (err, results, fields) {
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
}
