const pool = require('../db');
var moment = require('moment');
module.exports = {
  Simpan_Secret: function(index,server_id,jml,result,callback){
    pool.getConnection(function(err, connection) {
      if(jml != index){
        var item = result[index];
        var localAddress = "";
        if(item.hasOwnProperty("localAddress")){
          localAddress = item['localAddress'];
        }
        var sql_cek = "select * from ppp_secret where server_id=? and name=?";
        var query_cek = connection.query(sql_cek,[server_id,item['name']], function (err, results_cek, fields) {
          if (results_cek.length > 0){
            var sql_update = "update ppp_secret set id_ppp=?,password=?,profile=?,local_address=?,remote_address=?,is_ada=1 where server_id=? and name=? and profile_isolir=''";
            var query_data = connection.query(sql_update,[item['id'],item['password'],item['profile'],localAddress,item['remoteAddress'],server_id,item['name']], function (err, results3, fields) {
              if (!err){
                connection.release();
                index++;
                module.exports.Simpan_Secret(index,server_id,jml,result,callback);
              }else{
                connection.release();
                index++;
                module.exports.Simpan_Secret(index,server_id,jml,result,callback);
              }
            });
          }else{
            var sql_insert = "insert into ppp_secret(server_id,id_ppp,name,password,profile,local_address,remote_address,is_ada) values(?,?,?,?,?,?,?,1)";
            var query_data = connection.query(sql_insert,[server_id,item['id'],item['name'],item['password'],item['profile'],localAddress,item['remoteAddress']], function (err, results3, fields) {
              if (!err){
                connection.release();
                index++;
                module.exports.Simpan_Secret(index,server_id,jml,result,callback);
              }else{
                connection.release();
                index++;
                module.exports.Simpan_Secret(index,server_id,jml,result,callback);
              }
            });
          }
        });
      }else{
        connection.release();
        callback();
      }
    });
  },
  Simpan_Active_Connection: function(index,server_id,jml,result,callback){
    pool.getConnection(function(err, connection) {
      if(jml != index){
        var item = result[index];
        var sql_insert = "insert into ppp_active_connection(server_id,id_ppp,name,service,caller_id,encoding,address,uptime) values(?,?,?,?,?,?,?,?)";
        var query_data = connection.query(sql_insert,[server_id,item['id'],item['name'],item['service'],item['callerId'],item['encoding'],item['address'],item['uptime']], function (err, results3, fields) {
          if (!err){
            connection.release();
            index++;
            module.exports.Simpan_Active_Connection(index,server_id,jml,result,callback);
          }else{
            connection.release();
            index++;
            module.exports.Simpan_Active_Connection(index,server_id,jml,result,callback);
          }
        });
      }else{
        connection.release();
        callback();
      }
    });
  }
}
