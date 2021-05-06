const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
var moment = require('moment');
const fs = require('fs');
const formidable = require('formidable');
var uniqid = require('uniqid');
module.exports = {
  Simpan_Gambar: function(old_file,file,callback){
    var dirname = __dirname.toString().split("\\"); // Local
    // var dirname = __dirname.toString().split("/"); //Online
    dirname.pop();
    dirname = dirname.join("/");
    if(file != null){
      fs.unlink(dirname + old_file.replace("assets","public"), (err) => {
        var oldpath = file.path;
        var nama_file = uniqid() + ".png";
        var newpath = dirname + "/public/img/router/" + nama_file;
        fs.copyFile(oldpath, newpath, function (err) {
          callback("/assets/img/router/" + nama_file);
        });
      });
    }else{
      callback(old_file);
    }
  },
  GetData: function(user_id,callback){
    pool.getConnection(function(err, connection) {
      var arr_query = [];
      arr_query.push("user_id=" + user_id);
      var filter_query = "";
      if(arr_query.length > 0){
        filter_query = " where " + arr_query.join(" and ");
      }
      var sql_data = "select * from pengaturan " + filter_query;
      var query_data = connection.query(sql_data, function (err, results, fields) {
        if(results.length == 0){
          connection.release();
          callback(null);
        }else{
          connection.release();
          callback(results);
        }
      });
    });
  }
}
