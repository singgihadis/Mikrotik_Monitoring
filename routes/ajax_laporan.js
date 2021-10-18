const pool = require('../db');
module.exports = function(app){
  app.post(['/ajax/laporan_pembayaran_by_metode_bayar.html'],(req, res) => {
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
        var sql_data = "SELECT a.metode_bayar,count(a.id) AS jml_transaksi, sum(a.nominal_pembayaran) AS jml_pembayaran, sum(IFNULL(b.biaya_layanan,0)) as biaya_layanan, sum(IFNULL(b.biaya_layanan_duitku,0)) as biaya_layanan_duitku FROM pembayaran a LEFT JOIN pembayaran_reference b ON a.reference = b.reference LEFT JOIN member c on a.member_id=c.id LEFT JOIN ppp_secret d on c.ppp_secret_id=d.id LEFT JOIN server e on d.server_id=e.id LEFT JOIN user f on e.user_id=f.id where a.bulan = ? and a.tahun=? and a.is_bayar=1 and (f.id=? or f.id=?) group by a.metode_bayar";
        var query_data = connection.query(sql_data,[bulan,tahun,req.session.user_id,req.session.parent_user_id], function (err, results, fields) {
          var sql_data = "SELECT a.metode_bayar,count(a.id) AS jml_transaksi, sum(a.nominal_pembayaran) AS jml_pembayaran, sum(IFNULL(b.biaya_layanan,0)) as biaya_layanan, sum(IFNULL(b.biaya_layanan_duitku,0)) as biaya_layanan_duitku FROM pembayaran_khusus a LEFT JOIN pembayaran_khusus_reference b ON a.reference = b.reference LEFT JOIN member c on a.member_id=c.id LEFT JOIN ppp_secret d on c.ppp_secret_id=d.id LEFT JOIN server e on d.server_id=e.id LEFT JOIN user f on e.user_id=f.id where a.bulan = ? and a.tahun=? and a.is_bayar=1 and (f.id=? or f.id=?) group by a.metode_bayar";
          var query_data = connection.query(sql_data,[bulan,tahun,req.session.user_id,req.session.parent_user_id], function (err, results2, fields) {
            if(results.length == 0 && results2.length == 0){
              connection.release();
              var data = {is_error:true,data:[],msg:"Data tidak ditemukan"};
              res.send(JSON.stringify(data));
              res.end();
            }else{
              connection.release();
              var data = {is_error:false,data:results,data_khusus:results2};
              res.send(JSON.stringify(data));
              res.end();
            }
          });
        });
      });
    }else{
      var data = {is_error:true,msg:"Anda belum terlogin",must_login:true};
      res.send(JSON.stringify(data));
      res.end();
    }
  });
}
