const RouterOSClient = require('routeros-client').RouterOSClient;
const fs = require('fs');
module.exports = function(app){
  app.post(['/ajax/pengaturan.html'],(req, res) => {
    if(req.session.is_login){
      var dirname = __dirname.toString().split("\\");
      dirname.pop();
      dirname = dirname.join("/");
      fs.readFile(dirname + '/config.json', function (err, data) {
        if (err) {
          throw err;
        }
        var data = {is_error:false,data:data.toString()};
        res.send(JSON.stringify(data));
        res.end();
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
  app.post(['/ajax/pengaturan_simpan.html'],(req, res) => {
    if(req.session.is_login){
      var dirname = __dirname.toString().split("\\");
      dirname.pop();
      dirname = dirname.join("/");
      fs.readFile(dirname + '/config.json', function (err, data) {
        if (err) {
          throw err;
        }
        var data_json = JSON.parse(data.toString());
        var title = "";
        if(req.body.title != undefined){
          title = req.body.title;
        }
        var hasil = {
          title : title,
          favicon : data_json['favicon'],
          logo : data_json['logo']
        };
        fs.writeFile(dirname + '/config.json', JSON.stringify(hasil), function (err) {
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
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
