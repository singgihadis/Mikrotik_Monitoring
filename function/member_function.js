const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
var moment = require('moment');
module.exports = {
  Cek_Akses_Member: function(member_id,parent_member_id,callback){
    pool.getConnection(function(err, connection) {
      var sql_cek = "select a.id from member a inner join ppp_secret b on a.ppp_secret_id=b.id inner join server c on b.server_id=c.id inner join user d on c.user_id=d.id where d.id=? or d.id=?";
      var query_cek = connection.query(sql_cek,[member_id,parent_member_id], function (err, results_cek, fields) {
        if(results_cek.length == 0){
          connection.release();
          callback(false)
        }else{
          connection.release();
          callback(true);
        }
      });
    });
  },
  Traffic: function(){
    pool.getConnection(function(err, connection) {
      var sql_data = "SELECT a.id, a.nama, b.`name`, c.`host`, c.`password`, c.`port`, c.`user`, d.hasil, d.filled FROM member a INNER JOIN ppp_secret b ON a.ppp_secret_id = b.id INNER JOIN `server` c ON b.server_id = c.id LEFT JOIN member_traffic_data d ON a.id = d.member_id and d.tgl=CURDATE()";
      var query_data = connection.query(sql_data, function (err, results, fields) {
        if(results.length == 0){
          connection.release();
          module.exports.Traffic();
        }else{
          var arr_data_insert = [];
          results.forEach((item, i) => {
            if(item['filled'] == null){
              arr_data_insert.push("(" + item['id'] + ",CURDATE(),'')");
            }
          });
          if(arr_data_insert.length > 0){
            var sql_insert = "insert into member_traffic_data(member_id,tgl,hasil) values " + arr_data_insert.join(",");
            var query_data = connection.query(sql_insert, function (err, results3, fields) {
              if (!err){
                connection.release();
                module.exports.Traffic_Proses(0,results.length,results);
              }else{
                connection.release();
                module.exports.Traffic_Proses(0,results.length,results);
              }
            });
          }else{
            connection.release();
            module.exports.Traffic_Proses(0,results.length,results);
          }
        }
      });
    });
  },
  Traffic_Proses: function(index,jml,results){
    var item = results[index];
    if(item != undefined){
      var host = item['host'];
      var port = item['port'];
      var user = item['user'];
      var password = item['password'];
      var name = item['name'];
      const api = new RouterOSClient({
          host: host,
          port: port,
          user: user,
          password: password
      });
      api.connect().then((client) => {
        var torch = client.menu("/interface monitor-traffic").where({interface:"<pppoe-" + name + ">"}).stream((err, get_data, stream) => {
            try{
              var data = get_data[0];
              if(data != undefined){
                var hasil_arr = [];
                if(item['filled'] != null && item['filled'] != 0 && item['hasil'] != null){
                  hasil_arr = JSON.parse(item['hasil']);
                }
                var sekarang = moment().unix();
                var tx = "";
                if(data.hasOwnProperty("txBitsPerSecond")){
                  tx = data['txBitsPerSecond'];
                }
                var rx = "";
                if(data.hasOwnProperty("rxBitsPerSecond")){
                  rx = data['rxBitsPerSecond'];
                }
                hasil_arr.push({"s":sekarang,"tx":tx,"rx":rx});
                var hasil = "";
                if(hasil_arr.length > 0){
                  hasil = JSON.stringify(hasil_arr);
                }
                torch.stop();
                api.close();
                pool.getConnection(function(err, connection) {
                  var sql_update = "update member_traffic_data set hasil=?,filled=1 where member_id=? and tgl=CURDATE()";
                  var query_update = connection.query(sql_update,[hasil,item['id']], function (err, results3, fields) {
                    connection.release();
                    index++;
                    if(index == jml){
                      setTimeout(function(){
                        module.exports.Traffic();
                      },60000);
                    }else{
                      module.exports.Traffic_Proses(index,results.length,results);
                    }
                  });
                });
              }else{
                torch.stop();
                api.close();
                setTimeout(function(){
                  module.exports.Traffic();
                },60000);
              }
            }catch(err){
              setTimeout(function(){
                module.exports.Traffic();
              },60000);
            }
        });
      }).catch((err) => {
        index++;
        if(index == jml){
          setTimeout(function(){
            module.exports.Traffic();
          },60000);
        }else{
          module.exports.Traffic_Proses(index,results.length,results);
        }
      });
    }else{
      setTimeout(function(){
        module.exports.Traffic();
      },60000);
    }

  }
}
