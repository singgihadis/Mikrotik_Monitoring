const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
var moment = require('moment');
module.exports = {
  Simpan: function(index,server_id,jml,result,callback){
    pool.getConnection(function(err, connection) {
      if(jml != index){
        var item = result[index];
        var type = "";
        var data = "";
        if(item.hasOwnProperty("type")){
          type = item['type'];
        }
        if(item.hasOwnProperty("data")){
          data = item['data'];
        }
        var sql_insert = "insert ignore into dns(server_id,name,type,data,ttl) values(?,?,?,?,?)";
        var query_data = connection.query(sql_insert,[server_id,item['name'],type,data,item['ttl']], function (err, results3, fields) {
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
