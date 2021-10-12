var pengaturan_function = require("../function/pengaturan_function.js");
const fs = require('fs');
const formidable = require('formidable');
var uniqid = require('uniqid');
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/pengaturan.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("user_id=" + req.session.user_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "select * from pengaturan " + filter_query;
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
  app.post(['/ajax/pengaturan_simpan.html'],(req, res) => {
    if(req.session.is_login){
      pengaturan_function.GetData(req.session.user_id,"",function(results){
        var data_json = [];
        if(results != null){
          data_json = results;
        }
        var title = "";
        var website = "";
        var email = "";
        var no_wa = "";
        var cur_title = "";
        var cur_favicon = "";
        var cur_logo = "";
        var cur_bank = "";
        var cur_website = "";
        var cur_email = "";
        var cur_no_wa = "";
        if(data_json.length > 0){
          cur_title = data_json[0]['title'];
          cur_favicon = data_json[0]['favicon'];
          cur_logo = data_json[0]['logo'];
          cur_website = data_json[0]['website'];
          cur_email = data_json[0]['email'];
          cur_no_wa = data_json[0]['no_wa'];
        }
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          if(fields.hasOwnProperty("title")){
            title = fields.title;
          }else{
            title = cur_title;
          }
          if(fields.hasOwnProperty("bank")){
            bank = fields.bank;
          }else{
            bank = cur_bank;
          }
          if(fields.hasOwnProperty("website")){
            website = fields.website;
          }else{
            website = cur_website;
          }
          if(fields.hasOwnProperty("email")){
            email = fields.email;
          }else{
            email = cur_email;
          }
          if(fields.hasOwnProperty("no_wa")){
            no_wa = fields.no_wa;
          }else{
            no_wa = cur_no_wa;
          }
          var favicon_file = null;
          if(files.hasOwnProperty("favicon")){
            favicon_file = files.favicon;
          }
          var logo_file = null;
          if(files.hasOwnProperty("logo")){
            logo_file = files.logo;
          }
          pengaturan_function.Simpan_Gambar(cur_favicon,favicon_file,function(favicon_file_name){
            pengaturan_function.Simpan_Gambar(cur_logo,logo_file,function(logo_file_name){
              pool.getConnection(function(err, connection) {
                if(data_json.length > 0){
                  var sql_update = "update pengaturan set title=?,favicon=?,logo=?,website=?,email=?,no_wa=? where user_id=?";
                  var query_update = connection.query(sql_update,[title,favicon_file_name,logo_file_name,website,email,no_wa,req.session.user_id], function (err, results, fields) {
                    if (err){
                      var data = {is_error:true,msg:"Gagal menyimpan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }else{
                      var data = {is_error:false,msg:"Berhasil menyimpan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }
                  });
                }else{
                  var sql_insert = "insert into pengaturan(user_id,title,favicon,logo,website,email,no_wa,master_kota_id) values(?,?,?,?,?,?,?,?)";
                  var query_insert = connection.query(sql_insert,[req.session.user_id,title,favicon_file_name,logo_file_name,website,email,no_wa,0], function (err, results, fields) {
                    if (err){
                      var data = {is_error:true,msg:"Gagal menyimpan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }else{
                      var data = {is_error:false,msg:"Berhasil menyimpan"};
                      res.send(JSON.stringify(data));
                      res.end();
                    }
                  });
                }

              });
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
  app.post(['/ajax/bank_data.html'],(req, res) => {
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
          arr_query.push("concat(nama,no_rekening) like '%" + keyword + "%'");
        }
        arr_query.push("status_hapus=0");
        arr_query.push("user_id=" + req.session.user_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var limit_query = "";
        if(page == "x"){

        }else{
          limit_query = " limit " + ((page * 5) - 5) + ",6";
        }
        var sql_data = "select * from bank " + filter_query + " order by tgl_insert desc" + limit_query;
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
  app.post(['/ajax/bank_edit.html'],(req, res) => {
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
        var no_rekening = "";
        if(req.body.no_rekening != undefined){
          no_rekening = req.body.no_rekening;
        }
        var sql_insert = "update bank set nama=?,no_rekening=? where id=? and user_id=?";
        var query_insert = connection.query(sql_insert,[nama,no_rekening,id,req.session.user_id], function (err, results, fields) {
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
  app.post(['/ajax/bank_hapus.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = "";
        if(req.body.id != undefined){
          id = req.body.id;
        }
        var sql_insert = "update bank set status_hapus=0 where id=? and user_id=?";
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
  app.post(['/ajax/bank_tambah.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var nama = "";
        if(req.body.nama != undefined){
          nama = req.body.nama;
        }
        var no_rekening = "";
        if(req.body.no_rekening != undefined){
          no_rekening = req.body.no_rekening;
        }
        var sql_insert = "insert into bank(user_id,nama,no_rekening) values(?,?,?)";
        var query_insert = connection.query(sql_insert,[req.session.user_id,nama,no_rekening], function (err, results, fields) {
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
}
