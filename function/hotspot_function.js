const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
var moment = require('moment');
module.exports = {
  Simpan: function(index,server_id,jml,result,callback){
    pool.getConnection(function(err, connection) {
      if(jml != index){
        var item = result[index];
        var address = "";
        if(item.hasOwnProperty("address")){
          address = item['address'];
        }
        var mac_address = "";
        if(item.hasOwnProperty("macAddress")){
          mac_address = item['macAddress'];
        }
        var profile = "";
        if(item.hasOwnProperty("profile")){
          profile = item['profile'];
        }
        var comment = "";
        if(item.hasOwnProperty("comment")){
          comment = item['comment'];
        }
        var sql_insert = "insert ignore into hotspot_user(server_id,name,address,mac_address,profile,uptime,comment) values(?,?,?,?,?,?,?)";
        var query_data = connection.query(sql_insert,[server_id,item['name'],address,mac_address,profile,item['uptime'],comment], function (err, results3, fields) {
          if (!err){
            connection.release();
            index++;
            module.exports.Simpan(index,server_id,jml,result,callback);
          }else{
            connection.release();
            index++;
            module.exports.Simpan(index,server_id,jml,result,callback);
          }
        });
      }else{
        connection.release();
        callback();
      }
    });
  }
}
