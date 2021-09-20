var mou_function = require("../function/mou_function.js");
const fs = require('fs');
const formidable = require('formidable');
var uniqid = require('uniqid');
const pool = require('../db');
const config = require('../config');
var pdf = require("html-pdf");
module.exports = function(app){
  app.post(['/ajax/mou.html'],(req, res) => {
    if(req.session.is_login){
      var id = req.session.user_id;
      if(req.session.level == "2"){
        if(req.body.id != undefined){
          id = req.body.id;
        }
      }
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        arr_query.push("user_id='" + id + "'");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "select * from mou " + filter_query;
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
  app.post(['/ajax/mou_simpan.html'],(req, res) => {
    if(req.session.is_login){
      var id = req.session.user_id;
      if(req.session.level == "2"){
        if(req.body.id != undefined){
          id = req.body.id;
        }
      }
      mou_function.GetData(id,"",function(results){
        var data_json = [];
        if(results != null){
          data_json = results;
        }
        var nomor = "";
        if(req.body.nomor != undefined){
          nomor = req.body.nomor;
        }
        var tgl = "";
        if(req.body.tgl != undefined){
          tgl = req.body.tgl;
        }
        var nama_pihak1 = "";
        if(req.body.nama_pihak1 != undefined){
          nama_pihak1 = req.body.nama_pihak1;
        }
        var nik_pihak1 = "";
        if(req.body.nik_pihak1 != undefined){
          nik_pihak1 = req.body.nik_pihak1;
        }
        var jabatan_pihak1 = "";
        if(req.body.jabatan_pihak1 != undefined){
          jabatan_pihak1 = req.body.jabatan_pihak1;
        }
        var jabatan_ttd_pihak1 = "";
        if(req.body.jabatan_ttd_pihak1 != undefined){
          jabatan_ttd_pihak1 = req.body.jabatan_ttd_pihak1;
        }
        var alamat_pihak1 = "";
        if(req.body.alamat_pihak1 != undefined){
          alamat_pihak1 = req.body.alamat_pihak1;
        }
        var nama_pihak2 = "";
        if(req.body.nama_pihak2 != undefined){
          nama_pihak2 = req.body.nama_pihak2;
        }
        var nik_pihak2 = "";
        if(req.body.nik_pihak2 != undefined){
          nik_pihak2 = req.body.nik_pihak2;
        }
        var jabatan_pihak2 = "";
        if(req.body.jabatan_pihak2 != undefined){
          jabatan_pihak2 = req.body.jabatan_pihak2;
        }
        var jabatan_ttd_pihak2 = "";
        if(req.body.jabatan_ttd_pihak2 != undefined){
          jabatan_ttd_pihak2 = req.body.jabatan_ttd_pihak2;
        }
        var alamat_pihak2 = "";
        if(req.body.alamat_pihak2 != undefined){
          alamat_pihak2 = req.body.alamat_pihak2;
        }
        var nama_perusahaan = "";
        if(req.body.nama_perusahaan != undefined){
          nama_perusahaan = req.body.nama_perusahaan;
        }
        var penjualan_paling_cepat = "";
        if(req.body.penjualan_paling_cepat != undefined){
          penjualan_paling_cepat = req.body.penjualan_paling_cepat;
        }
        var penjualan_paling_lambat = "";
        if(req.body.penjualan_paling_lambat != undefined){
          penjualan_paling_lambat = req.body.penjualan_paling_lambat;
        }
        if(req.session.level != "2"){
          nomor = data_json['nomor'];
          tgl = data_json['tgl'];
          nama_pihak1 = data_json['nama_pihak1'];
          nik_pihak1 = data_json['nik_pihak1'];
          jabatan_pihak1 = data_json['jabatan_pihak1'];
          jabatan_ttd_pihak1 = data_json['jabatan_ttd_pihak1'];
          alamat_pihak1 = data_json['alamat_pihak1'];
          penjualan_paling_cepat = data_json['penjualan_paling_cepat'];
          penjualan_paling_lambat = data_json['penjualan_paling_lambat'];
        }
        pool.getConnection(function(err, connection) {
          if(data_json.length > 0){
            var sql_update = "update mou set nomor=?,tgl=?,nama_pihak1=?,nik_pihak1=?,jabatan_pihak1=?,jabatan_ttd_pihak1=?,alamat_pihak1=?,nama_pihak2=?,nik_pihak2=?,jabatan_pihak2=?,jabatan_ttd_pihak2=?,alamat_pihak2=?,nama_perusahaan=?,penjualan_paling_cepat=?,penjualan_paling_lambat=? where user_id=?";
            var query_update = connection.query(sql_update,[nomor,tgl,nama_pihak1,nik_pihak1,jabatan_pihak1,jabatan_ttd_pihak1,alamat_pihak1,nama_pihak2,nik_pihak2,jabatan_pihak2,jabatan_ttd_pihak2,alamat_pihak2,nama_perusahaan,penjualan_paling_cepat,penjualan_paling_lambat,req.session.user_id], function (err, results, fields) {
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
            var sql_insert = "insert into mou(user_id,nomor,tgl,nama_pihak1,nik_pihak1,jabatan_pihak1,jabatan_ttd_pihak1,alamat_pihak1,nama_pihak2,nik_pihak2,jabatan_pihak2,jabatan_ttd_pihak2,alamat_pihak2,nama_perusahaan,penjualan_paling_cepat,penjualan_paling_lambat) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            var query_insert = connection.query(sql_insert,[req.session.user_id,nomor,tgl,nama_pihak1,nik_pihak1,jabatan_pihak1,jabatan_ttd_pihak1,alamat_pihak1,nama_pihak2,nik_pihak2,jabatan_pihak2,jabatan_ttd_pihak2,alamat_pihak2,nama_perusahaan,penjualan_paling_cepat,penjualan_paling_lambat], function (err, results, fields) {
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
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/mou_generate_pdf.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var id = req.session.user_id;
        if(req.session.level == "2"){
          if(req.body.id != undefined){
            id = req.body.id;
          }
        }
        var arr_query = [];
        arr_query.push("user_id='" + id + "'");
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "select * from mou " + filter_query;
        var query_data = connection.query(sql_data, function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var html = __dirname + '/../mou.html';
            fs.readFile(html, 'utf8', function(err, data) {
                if (err) throw err;
                if (!fs.existsSync("./public/pdf/" + req.session.user_id)){
                    fs.mkdirSync("./public/pdf/" + req.session.user_id);
                }
                var options = { format: 'Legal'};
                pdf.create(data,options).toStream(function(err, stream){
                  stream.pipe(fs.createWriteStream('./public/pdf/' + req.session.user_id + '/mou.pdf'));
                  var data = {is_error:false,data:[],msg:"sukses",output:config['main_url'] + '/assets/pdf/' + req.session.user_id + '/mou.pdf'};
                  res.send(JSON.stringify(data));
                  res.end();
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
}
