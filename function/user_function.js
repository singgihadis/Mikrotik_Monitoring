var moment = require('moment');
const fs = require('fs');
const formidable = require('formidable');
var uniqid = require('uniqid');
module.exports = {
  Simpan_Gambar: function(old_file,file,callback){
    // var dirname = __dirname.toString().split("\\"); // Local
    var dirname = __dirname.toString().split("/"); //Online
    dirname.pop();
    dirname = dirname.join("/");
    if(file != null){
      fs.unlink(dirname + old_file.replace("assets","public"), (err) => {
        var oldpath = file.path;
        var nama_file = uniqid() + ".png";
        var newpath = dirname + "/public/img/user/" + nama_file;
        fs.copyFile(oldpath, newpath, function (err) {
          callback("/assets/img/user/" + nama_file);
        });
      });
    }else{
      callback(old_file);
    }
  },
  Simpan_File: function(old_file,file,callback){
    var dirname = __dirname.toString().split("\\"); // Local
    // var dirname = __dirname.toString().split("/"); //Online
    dirname.pop();
    dirname = dirname.join("/");
    if(file != null){
      fs.unlink(dirname + old_file.replace("assets","public"), (err) => {
        var oldpath = file.path;
        var nama_file = uniqid() + ".png";
        var newpath = dirname + "/public/file/user/" + nama_file;
        fs.copyFile(oldpath, newpath, function (err) {
          callback("/assets/file/user/" + nama_file);
        });
      });
    }else{
      callback(old_file);
    }
  }
}
