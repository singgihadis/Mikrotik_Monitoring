const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
var moment = require('moment');
module.exports = {
  Ping: function(){
    pool.getConnection(function(err, connection) {
      var sql_data = "select a.*,b.host,b.port,b.user,b.password,c.hasil,c.filled from monitoring a inner join server b on a.server_id=b.id left join ping_data c on a.id=c.monitoring_id where a.is_run=1";
      var query_data = connection.query(sql_data, function (err, results, fields) {
        if(results.length == 0){
          connection.release();
          module.exports.Ping();
        }else{
          var arr_data_insert = [];
          results.forEach((item, i) => {
            if(item['filled'] == null){
              arr_data_insert.push("(" + item['id'] + ",CURDATE(),'')");
            }
          });
          if(arr_data_insert.length > 0){
            var sql_insert = "insert into ping_data(monitoring_id,tgl,hasil) values " + arr_data_insert.join(",");
            var query_data = connection.query(sql_insert, function (err, results2, fields) {
              if (!err){
                connection.release();
                module.exports.Ping_Proses(0,results.length,results);
              }else{
                connection.release();
                module.exports.Ping_Proses(0,results.length,results);
              }
            });
          }else{
            connection.release();
            module.exports.Ping_Proses(0,results.length,results);
          }
        }
      });
    });
  },
  Ping_Proses: function(index,jml,results){
    var item = results[index];
    var host = item['host'];
    var port = item['port'];
    var user = item['user'];
    var password = item['password'];
    var client_ip = item['client_ip'];
    const api = new RouterOSClient({
        host: host,
        port: port,
        user: user,
        password: password
    });
    api.connect().then((client) => {
      var torch = client.menu("/ping").where({address:client_ip}).stream((err, data, stream) => {
          if (err) return err; // got an error while trying to stream
          var hasil_arr = [];
          if(item['filled'] != null && item['hasil'] != null){
            hasil_arr = JSON.parse(item['hasil']);
          }
          var sekarang = moment().unix();
          var time = "";
          if(data.hasOwnProperty("time")){
            time = data['time'];
          }
          hasil_arr.push({"s":sekarang,"t":time});
          var hasil = "";
          if(hasil_arr.length > 0){
            hasil = JSON.stringify(hasil_arr);
          }
          torch.stop();
          api.close();
          pool.getConnection(function(err, connection) {
            var sql_update = "update ping_data set hasil=? where monitoring_id=?";
            var query_update = connection.query(sql_update,[hasil,item['id']], function (err, results3, fields) {
              connection.release();
              index++;
              if(index == jml){
                setTimeout(function(){
                  module.exports.Ping();
                },60000);
              }else{
                module.exports.Ping_Proses(index,results.length,results);
              }
            });
          });
      });
    }).catch((err) => {
      module.exports.Ping();
    });
  }
}
