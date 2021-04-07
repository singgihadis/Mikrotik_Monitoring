const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/system_identity.html'],(req, res) => {
    if(req.session.is_login){
      var host = req.session.host;
      var port = req.session.port;
      var user = req.session.user;
      var password = req.session.password;
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password
      });
      api.connect().then((client) => {
        client.menu("/system identity").getOnly().then((result) => {
            var data = {is_error:false,data:[{nama:result['name']}]};
            api.close();
            res.send(JSON.stringify(data));
            res.end();
        }).catch((err) => {
          var data = {is_error:true,msg:err.message};
          res.send(JSON.stringify(data));
          res.end();
        });
      }).catch((err) => {
        var data = {is_error:true,msg:err.message};
        res.send(JSON.stringify(data));
        res.end();
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
