var moment = require("moment");
const pool = require('../db');
const config = require('../config');
module.exports = function(app){
  app.post(['/ajax/member_stat_inserted_daily.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var bulan = "";
        if(req.body.bulan != undefined){
          bulan = req.body.bulan;
        }
        var tahun = "";
        if(req.body.tahun != undefined){
          tahun = req.body.tahun;
        }
        var sql_data = "SELECT count(a.id) AS jml, DAY(a.tgl_insert) as tgl FROM member a inner join ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue)AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id inner join server c on b.server_id=c.id where c.user_id=? and MONTH(a.tgl_insert)= ? AND YEAR(a.tgl_insert)= ? GROUP BY DAY(a.tgl_insert)";
        var query_data = connection.query(sql_data,[req.session.user_id,bulan,tahun], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:false,data:results};
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
  app.post(['/ajax/member_stat_inserted_monthly.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var tahun = "";
        if(req.body.tahun != undefined){
          tahun = req.body.tahun;
        }
        var sql_data = "SELECT count(a.id) AS jml, MONTH(a.tgl_insert) as bln FROM member a inner join ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue)AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id inner join server c on b.server_id=c.id where c.user_id=? and YEAR(a.tgl_insert)= ? GROUP BY MONTH(a.tgl_insert)";
        var query_data = connection.query(sql_data,[req.session.user_id,tahun], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:false,data:results};
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
  app.post(['/ajax/member_stat_inserted_yearly.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "SELECT count(a.id) AS jml, YEAR(a.tgl_insert) as thn FROM member a inner join ( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue)AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id inner join server c on b.server_id=c.id where c.user_id=? GROUP BY YEAR(a.tgl_insert)";
        var query_data = connection.query(sql_data,[req.session.user_id], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:false,data:results};
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
  app.post(['/ajax/member_terbaru.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "SELECT a.* FROM member a INNER JOIN( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue)AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN SERVER c ON b.server_id = c.id where c.user_id=? order by a.tgl_insert desc limit 5";
        var query_data = connection.query(sql_data,[req.session.user_id], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:false,data:results};
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
  app.post(['/ajax/kapasitas_total.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var sql_data = "SELECT a.nama, SUM(IFNULL(e.kapasitas, 0))AS kapasitas FROM SERVER a LEFT JOIN USER b ON a.user_id = b.id LEFT JOIN( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, server_id FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, server_id FROM simple_queue) AS c ON a.id = c.server_id LEFT JOIN member d ON d.ppp_secret_id = c.ppp_secret_id or d.simple_queue_id=c.simple_queue_id LEFT JOIN master_paket e ON d.master_paket_id = e.id where a.user_id=? or a.user_id=? or (" + req.session.level + "=2 and (a.user_id=? or a.user_id=?)) GROUP BY a.id";
        var query_data = connection.query(sql_data,[req.session.user_id,req.session.parent_user_id,req.session.user_id,req.session.parent_user_id], function (err, results, fields) {
          if(results.length == 0){
            connection.release();
            var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
            res.send(JSON.stringify(data));
            res.end();
          }else{
            connection.release();
            var data = {is_error:false,data:results};
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
