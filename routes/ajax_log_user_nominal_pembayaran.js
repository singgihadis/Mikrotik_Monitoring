const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/log_user_nominal_pembayaran_data.html'],(req, res) => {
    if(req.session.is_login){
      pool.getConnection(function(err, connection) {
        var page = 1;
        if(req.body.page != undefined){
          page = req.body.page;
        }
        var nama_user = "";
        if(req.body.nama_user != undefined){
          nama_user = req.body.nama_user;
        }
        var nama_member = "";
        if(req.body.nama_member != undefined){
          nama_member = req.body.nama_member;
        }
        var level_user = req.session.level;
        var arr_query = [];
        if(nama_user != ""){
          arr_query.push("c.nama = " + nama_user + "");
        }
        if(nama_member != ""){
          arr_query.push("b.nama = " + nama_member + "");
        }
        if(level_user == "2"){
          var filter_query = "";
          if(arr_query.length > 0){
            filter_query = " where " + arr_query.join(" and ");
          }
          var limit = (page * 10) - 10;
          var query_limit = "";
          if(page != "x"){
            query_limit = " limit " + limit + ",11";
          }
          var sql_data = "select a.*,IFNULL(b.nama,'') as nama_member,IFNULL(c.nama,'') as nama_user from member_nominal_pembayaran_log a left join member b on a.member_id=b.id left join user c on a.user_id=c.id " + filter_query + " order by tgl_insert desc" + query_limit;
          var query_data = connection.query(sql_data, function (err, results, fields) {
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
        }else{
          connection.release();
          var data = {is_error:true,data:[],msg:"Anda tidak mempunyai akses"};
          res.send(JSON.stringify(data));
          res.end();
        }
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
