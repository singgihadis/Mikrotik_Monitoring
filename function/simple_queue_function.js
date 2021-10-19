const pool = require('../db');
var moment = require('moment');
module.exports = {
  Simpan_Simple_Queue: function(index,server_id,jml,result,callback){
    pool.getConnection(function(err, connection) {
      if(jml != index){
        var item = result[index];
        var target = "";
        if(item.hasOwnProperty("target")){
          target = item['target'];
        }
        var maxLimit = item['maxLimit'];
        var upload_max_limit = "";
        var download_max_limit = "";
        if(maxLimit != ""){
          var arr_maxLimit = maxLimit.split("/");
          upload_max_limit = arr_maxLimit[0];
          download_max_limit = arr_maxLimit[1];
        }
        var sql_cek = "select * from simple_queue where server_id=? and name=?";
        var query_cek = connection.query(sql_cek,[server_id,item['name']], function (err, results_cek, fields) {
          if (results_cek.length > 0){
            var sql_update = "update simple_queue set id_simple_queue=?,target=?,upload_max_limit=?,download_max_limit=? where server_id=? and name=?";
            var query_data = connection.query(sql_update,[item['id'],item['target'],upload_max_limit,download_max_limit,server_id,item['name']], function (err, results3, fields) {
              if (!err){
                connection.release();
                index++;
                module.exports.Simpan_Simple_Queue(index,server_id,jml,result,callback);
              }else{
                connection.release();
                index++;
                module.exports.Simpan_Simple_Queue(index,server_id,jml,result,callback);
              }
            });
          }else{
            var sql_insert = "insert into simple_queue(server_id,id_simple_queue,name,target,upload_max_limit,download_max_limit) values(?,?,?,?,?,?)";
            var query_data = connection.query(sql_insert,[server_id,item['id'],item['name'],item['target'],upload_max_limit,download_max_limit], function (err, results3, fields) {
              if (!err){
                connection.release();
                index++;
                module.exports.Simpan_Simple_Queue(index,server_id,jml,result,callback);
              }else{
                connection.release();
                index++;
                module.exports.Simpan_Simple_Queue(index,server_id,jml,result,callback);
              }
            });
          }
        });
      }else{
        connection.release();
        callback();
      }
    });
  }
}
