const { exec } = require("child_process");
const config = require('../config');
module.exports = function(app){
  app.post(['/ajax/download_database.html'],(req, res) => {
    if(req.session.is_login){
      exec("mysqldump -h 103.166.33.248 -u remote2 -ppwd19 mikrotik_monitoring > backup/db/mikrotik_monitoring.sql", (error, stdout, stderr) => {
        if (error) {
            var data = {is_error:true,msg:"Gagal membackup"}
            res.send(JSON.stringify(data));
            res.end();
            console.log(`error: ${error.message}`);
            return;
        }else{
          var data = {is_error:false,msg:"",output:config['main_url'] + '/backup/db/mikrotik_monitoring.sql'}
          res.send(JSON.stringify(data));
          res.end();
          return;
        }
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
