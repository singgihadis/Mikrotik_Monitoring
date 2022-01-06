const RouterOSClient = require('routeros-client').RouterOSClient;
const pool = require('../db');
var moment = require('moment');
var request = require('request');
var fs = require('fs');
var is_traffic_running = "0";
var request_function = require("../function/request_function.js");
module.exports = {
  BuatTagihanBulanan: function(){
    pool.getConnection(function(err, connection) {
      var select_indicator_data = "select * from live_indicator_data where id=1";
      var query_indicator_data = connection.query(select_indicator_data, function (err, results_indicator_data, fields) {
        if(results_indicator_data.length > 0){
          var is_update = results_indicator_data[0]['value'];
          if(is_update == "1"){
            var sql_update_indicator = "update live_indicator_data set value='0' where id=1";
            var query_update_indicator = connection.query(sql_update_indicator, function (err, results, fields) {
              var select_member = "select * from member";
              var query_member = connection.query(select_member, function (err, results_member, fields) {
                if(results_member.length == 0){
                  connection.release();
                  setTimeout(function(){
                    module.exports.BuatTagihanBulanan();
                  },60000);
                }else{
                  connection.release();
                  module.exports.BuatTagihanBulanan_ProsesData(0,results_member,function(){
                    setTimeout(function(){
                      module.exports.BuatTagihanBulanan();
                    },60000);
                  });
                }
              });
            });
          }else{
            connection.release();
            setTimeout(function(){
              module.exports.BuatTagihanBulanan();
            },60000);
          }
        }else{
          connection.release();
          setTimeout(function(){
            module.exports.BuatTagihanBulanan();
          },60000);
        }
      });
    });
  },
  BuatTagihanBulanan_ProsesData: function(index,data_member,callback){
    pool.getConnection(function(err, connection) {
      var jml_member = data_member.length;
      if(index < jml_member){
        var data_member_item = data_member[index];
        var member_id = data_member_item['id'];
        var awal_tagihan_bulan = data_member_item['awal_tagihan_bulan'];
        var awal_tagihan_tahun = data_member_item['awal_tagihan_tahun'];
        var is_berhenti_langganan = data_member_item['is_berhenti_langganan'];
        var bulan_berhenti_langganan = data_member_item['bulan_berhenti_langganan'];
        var tahun_berhenti_langganan = data_member_item['tahun_berhenti_langganan'];

        var sql_delete_member = "delete from pembayaran where member_id=? and is_bayar=0";
        var query_delete_member = connection.query(sql_delete_member,[member_id], function (err, results_pembayaran, fields) {
          var akhir_tagihan_bulan = parseInt(moment().format("M"));
          var akhir_tagihan_tahun = parseInt(moment().format("YYYY"));
          if(is_berhenti_langganan == "1"){
            akhir_tagihan_bulan = bulan_berhenti_langganan;
            if(akhir_tagihan_bulan == 1){
              akhir_tagihan_bulan = 12;
            }else{
              akhir_tagihan_bulan = akhir_tagihan_bulan - 1;
            }
            akhir_tagihan_tahun = tahun_berhenti_langganan;
          }
          var filter_query = " and ";
          filter_query += " (((bulan >= " + awal_tagihan_bulan + " and tahun =" + awal_tagihan_tahun + ") and (bulan <= " + akhir_tagihan_bulan + " and tahun = " + akhir_tagihan_tahun + "))";
          filter_query += " or (tahun > " + awal_tagihan_tahun + " or tahun < " + akhir_tagihan_tahun + "))";
          var select_pembayaran = "select * from pembayaran where member_id=? " + filter_query;
          var query_pembayaran = connection.query(select_pembayaran,[member_id], function (err, results_pembayaran, fields) {
            var data_exits = [];
            results_pembayaran.forEach((item, i) => {
              data_exits.push({
                bulan:item['bulan'],tahun:item['tahun']
              });
            });
            var data = [];
            for(var i=awal_tagihan_tahun;i<=akhir_tagihan_tahun;i++){
              if(awal_tagihan_tahun == akhir_tagihan_tahun){
                for(var a=awal_tagihan_bulan;a<=akhir_tagihan_bulan;a++){
                  data.push({bulan:a,tahun:i});
                }
              }else{
                if(i == awal_tagihan_tahun){
                  for(var a=awal_tagihan_bulan;a<=12;a++){
                    data.push({bulan:a,tahun:i});
                  }
                }else if(i == akhir_tagihan_tahun){
                  for(var a=1;a<=akhir_tagihan_bulan;a++){
                    data.push({bulan:a,tahun:i});
                  }
                }else{
                  for(var a=1;a<=12;a++){
                    data.push({bulan:a,tahun:i});
                  }
                }
              }
            }
            var data_final = data;
            data.forEach((item, i) => {
              data_exits.forEach((item2, i2) => {
                if(item['bulan'] == item2['bulan'] && item['tahun'] == item2['tahun']){
                  data_final = data_final.filter(function( obj ) {
                    if(obj.bulan == item2['bulan'] && obj.tahun == item2['tahun']){
                      return false;
                    }else{
                      return true;
                    }
                  });
                }
              });
            });
            if(data_final.length > 0){
              connection.release();
              module.exports.BuatTagihanBulanan_Insert(0,data_member_item,data_final,function(){
                index++;
                module.exports.BuatTagihanBulanan_ProsesData(index,data_member,callback);
              });
            }else{
              connection.release();
              index++;
              module.exports.BuatTagihanBulanan_ProsesData(index,data_member,callback);
            }
          });
        });
      }else{
        connection.release();
        callback();
      }
    });
  },
  BuatTagihanBulanan_Insert : function(index,data_member_item,data,callback){
    pool.getConnection(function(err, connection) {
      if(data.length > 0){
        var data_item = data[index];
        var sql_insert = "insert into pembayaran(member_id,bulan,tahun,metode_bayar,bank_id,nominal_pembayaran,reference,is_bayar) values(?,?,?,?,?,?,?,?)";
        var query_insert = connection.query(sql_insert,[data_member_item['id'],data_item['bulan'],data_item['tahun'],"0","0",data_member_item['nominal_pembayaran'],"","0"], function (err, results_pembayaran, fields) {
          connection.release();
          if(index < (data.length - 1)){
            index++;
            module.exports.BuatTagihanBulanan_Insert(index,data_member_item,data,callback);
          }else{
            connection.release();
            callback();
          }
        });
      }else{
        connection.release();
        callback();
      }
    });

  },
  Cek_Akses_Member: function(user_id,parent_user_id,callback){
    pool.getConnection(function(err, connection) {
      var sql_cek = "SELECT a.id FROM member a INNER JOIN( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, NAME AS NAME, server_id, 1 AS type FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, NAME AS NAME, server_id, 2 FROM simple_queue)AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN server c ON b.server_id = c.id INNER JOIN user d ON c.user_id = d.id where d.id=? or d.id=?";
      var query_cek = connection.query(sql_cek,[user_id,parent_user_id], function (err, results_cek, fields) {
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
      var sql_data = "SELECT a.id, a.nama, b.`name`, c.`host`, c.`password`, c.`port`, c.`user`, d.hasil, d.filled FROM member a INNER JOIN( SELECT id AS ppp_secret_id, NULL AS simple_queue_id, NAME AS NAME, server_id, 1 AS type FROM ppp_secret UNION SELECT NULL AS ppp_secret_id, id AS simple_queue_id, NAME AS NAME, server_id, 2 FROM simple_queue)AS b ON a.ppp_secret_id = b.ppp_secret_id or a.simple_queue_id=b.simple_queue_id INNER JOIN `server` c ON b.server_id = c.id LEFT JOIN member_traffic_data d ON a.id = d.member_id AND d.tgl = CURDATE()";
      var query_data = connection.query(sql_data, function (err, results, fields) {
        if(results.length == 0){
          connection.release();
          is_traffic_running = "0";
          setTimeout(function(){
            module.exports.Traffic();
          },60000);
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
      var param = {
        'host':host,
        'port':port,
        'user':user,
        'password':password,
        'name':name};
      request_function.Post("/ajax/get_traffic_data_service.html",param,function(response){
        var data = JSON.parse(response);
        if(data.is_error){
          index++;
          if(index == jml){
            setTimeout(function(){
              module.exports.Traffic();
            },60000);
          }else{
            module.exports.Traffic_Proses(index,results.length,results);
          }
        }else{
          var hasil_arr = [];
          if(item['filled'] != null && item['filled'] != 0 && item['hasil'] != null){
            hasil_arr = JSON.parse(item['hasil']);
          }
          var sekarang = data.sekarang;
          var tx = data.tx;
          var rx = data.rx;
          hasil_arr.push({"s":sekarang,"tx":tx,"rx":rx});
          var hasil = "";
          if(hasil_arr.length > 0){
            hasil = JSON.stringify(hasil_arr);
          }
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
        }
      });
    }else{
      setTimeout(function(){
        module.exports.Traffic();
      },60000);
    }
  },
  Set_Live_Indicator_Data: function(){
    pool.getConnection(function(err, connection) {
      var select_indicator_data = "select * from live_indicator_data where id=2";
      var query_indicator_data = connection.query(select_indicator_data, function (err, results_indicator_data, fields) {
        if(results_indicator_data.length > 0){
          var bulantahun = results_indicator_data[0]['value'];
          var d = new Date();
          var bulan = parseInt(d.getMonth()) + 1;
          var tahun = d.getFullYear();
          var bulan_tahun_sekarang = bulan + "_" + tahun;
          if(bulantahun == bulan_tahun_sekarang){
            setTimeout(function(){
              module.exports.Set_Live_Indicator_Data();
            },3600000);
          }else{
            var sql_update_indicator_blnthn = "update live_indicator_data set value='" + bulan_tahun_sekarang + "' where id=2";
            var query_update_indicator_blnthn = connection.query(sql_update_indicator_blnthn, function (err, results, fields) {
              var sql_update_indicator = "update live_indicator_data set value='1' where id=1";
              var query_update_indicator = connection.query(sql_update_indicator, function (err, results, fields) {
                connection.release();
                var data = {is_error:false,msg:"Berhasil menyimpan"};
                res.send(JSON.stringify(data));
                res.end();
              });
            });
          }
        }else{
          setTimeout(function(){
            module.exports.Set_Live_Indicator_Data();
          },3600000);
        }
      });
    });
  }
}
