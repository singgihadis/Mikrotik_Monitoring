const pool = require('../db');
const crypto = require('crypto');
const formidable = require('formidable');
var user_function = require("../function/user_function.js");
module.exports = function(app){
  app.post(['/ajax/pendaftaran.html'],(req, res) => {
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
        var level = "1";
        var parent_user_id = "0";
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
            var sql_insert = "insert into user(nama,user,level,password,parent_user_id,nik,email,alamat,file_npwp,file_ktp,status) values(?,?,?,?,?,?,?,?,?,?,?)";
            var query_insert = connection.query(sql_insert,[nama,user,level,password,parent_user_id,nik,email,alamat,npwp_file_name,ktp_file_name,"0"], function (err, results, fields) {
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
    });
  });
}
