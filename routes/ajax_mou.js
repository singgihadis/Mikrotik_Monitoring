var mou_function = require("../function/mou_function.js");
var public_function = require("../function/public_function.js");
const fs = require('fs');
const formidable = require('formidable');
var uniqid = require('uniqid');
const pool = require('../db');
const config = require('../config');
var moment = require("moment");
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
        var nomor = "0";
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
          nama_perusahaan = data_json['nama_perusahaan'];
          penjualan_paling_cepat = data_json['penjualan_paling_cepat'];
          penjualan_paling_lambat = data_json['penjualan_paling_lambat'];
        }
        pool.getConnection(function(err, connection) {
          if(data_json.length > 0){
            var sql_update = "update mou set nomor=?,tgl=?,nama_pihak1=?,nik_pihak1=?,jabatan_pihak1=?,jabatan_ttd_pihak1=?,alamat_pihak1=?,nama_pihak2=?,nik_pihak2=?,jabatan_pihak2=?,jabatan_ttd_pihak2=?,alamat_pihak2=?,nama_perusahaan=?,penjualan_paling_cepat=?,penjualan_paling_lambat=? where user_id=?";
            var query_update = connection.query(sql_update,[nomor,tgl,nama_pihak1,nik_pihak1,jabatan_pihak1,jabatan_ttd_pihak1,alamat_pihak1,nama_pihak2,nik_pihak2,jabatan_pihak2,jabatan_ttd_pihak2,alamat_pihak2,nama_perusahaan,penjualan_paling_cepat,penjualan_paling_lambat,id], function (err, results, fields) {
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
            var query_insert = connection.query(sql_insert,[id,nomor,tgl,nama_pihak1,nik_pihak1,jabatan_pihak1,jabatan_ttd_pihak1,alamat_pihak1,nama_pihak2,nik_pihak2,jabatan_pihak2,jabatan_ttd_pihak2,alamat_pihak2,nama_perusahaan,penjualan_paling_cepat,penjualan_paling_lambat], function (err, results, fields) {
              if (err){
                var data = {is_error:true,msg:"Gagal menyimpan"};
                res.send(JSON.stringify(data));
                res.end();
              }else{
                var sql_insert_file = "insert into file(user_id,nama,file,is_mou) values(?,?,?,?)";
                var query_insert_file = connection.query(sql_insert_file,[id,"MoU","/assets/pdf/" + id + "/mou.pdf","1"], function (err, results, fields) {
                  if (err){
                    var data = {is_error:true,msg:"Gagal menyimpan ke file"};
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
            var data = {is_error:true,data:[],msg:"Data belum dilengkapi"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            var data_mou = results[0];
            connection.release();
            var html = __dirname + '/../mou.html';
            fs.readFile(html, 'utf8', function(err, data) {
                if (err) throw err;
                if (!fs.existsSync("./public/pdf/" + id)){
                    fs.mkdirSync("./public/pdf/" + id);
                }
                var tgl = data_mou['tgl'];
                var tgl_desc = "";
                var tgl_formated = "";
                if(tgl != null && tgl != ""){
                  var moment_tgl = moment(tgl,"YYYY-MM-DD");
                  tgl_formated = moment_tgl.format("DD") + " " + public_function.NamaBulan(moment_tgl.format("M")) + " " + moment_tgl.format("YYYY");
                  tgl_desc += public_function.NamaHari(moment_tgl.format("E"));
                  tgl_desc += " tanggal " + moment_tgl.format("D");
                  tgl_desc += " bulan " + public_function.NamaBulan(moment_tgl.format("M"));
                  tgl_desc += " Tahun " + public_function.TahunAngkaToText(moment_tgl.format("YYYY"));
                  tgl_desc += " ( " + moment_tgl.format("DD-MM-YYYY") + " )";
                }
                data = data.replace(/{{tgl_desc}}/g,tgl_desc);
                data = data.replace(/{{tgl}}/g,tgl_formated);
                data = data.replace(/{{nama_perusahaan}}/g,data_mou['nama_perusahaan']);
                data = data.replace(/{{nomor}}/g,data_mou['nomor']);
                data = data.replace(/{{nama_pihak1}}/g,data_mou['nama_pihak1']);
                data = data.replace(/{{nik_pihak1}}/g,data_mou['nik_pihak1']);
                data = data.replace(/{{jabatan_pihak1}}/g,data_mou['jabatan_pihak1']);
                data = data.replace(/{{alamat_pihak1}}/g,data_mou['alamat_pihak1']);
                data = data.replace(/{{nama_pihak2}}/g,data_mou['nama_pihak2']);
                data = data.replace(/{{nik_pihak2}}/g,data_mou['nik_pihak2']);
                data = data.replace(/{{jabatan_pihak2}}/g,data_mou['jabatan_pihak2']);
                data = data.replace(/{{alamat_pihak2}}/g,data_mou['alamat_pihak2']);
                data = data.replace(/{{jabatan_ttd_pihak1}}/g,data_mou['jabatan_ttd_pihak1']);
                data = data.replace(/{{jabatan_ttd_pihak2}}/g,data_mou['jabatan_ttd_pihak2']);
                var penjualan_paling_cepat = data_mou['penjualan_paling_cepat'];
                var penjualan_paling_cepat_formated = "";
                if(penjualan_paling_cepat != "" && penjualan_paling_cepat != null){
                  var penjualan_paling_cepat_moment = moment(penjualan_paling_cepat,"YYYY-MM-DD");
                  penjualan_paling_cepat_formated = penjualan_paling_cepat_moment.format("DD") + " " + public_function.NamaBulan(penjualan_paling_cepat_moment.format("M")) + " " + penjualan_paling_cepat_moment.format("YYYY");
                }
                data = data.replace(/{{penjualan_paling_cepat}}/g,penjualan_paling_cepat_formated);
                var penjualan_paling_lambat = data_mou['penjualan_paling_lambat'];
                var penjualan_paling_lambat_formated = "";
                if(penjualan_paling_lambat != "" && penjualan_paling_lambat != null){
                  var penjualan_paling_lambat_moment = moment(penjualan_paling_lambat,"YYYY-MM-DD");
                  penjualan_paling_lambat_formated = penjualan_paling_lambat_moment.format("DD") + " " + public_function.NamaBulan(penjualan_paling_lambat_moment.format("M")) + " " + penjualan_paling_lambat_moment.format("YYYY");
                }
                data = data.replace(/{{penjualan_paling_lambat}}/g,penjualan_paling_lambat_formated);
                var options = {
                  format: 'Legal'
                };
                pdf.create(data,options).toStream(function(err, stream){
                  stream.pipe(fs.createWriteStream('./public/pdf/' + id + '/mou.pdf'));
                  var data = {is_error:false,data:[],msg:"sukses",output:config['main_url'] + '/assets/pdf/' + id + '/mou.pdf'};
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
