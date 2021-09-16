const pool = require('../db');
var moment = require('moment');
const fs = require('fs');
const formidable = require('formidable');
var uniqid = require('uniqid');
module.exports = {
  GetData: function(user_id,parent_user_id,callback){
    pool.getConnection(function(err, connection) {
      var arr_query = [];
      arr_query.push("user_id='" + user_id + "'");
      var filter_query = "";
      if(arr_query.length > 0){
        filter_query = " where " + arr_query.join(" and ");
      }
      var sql_data = "select * from mou " + filter_query;
      var query_data = connection.query(sql_data, function (err, results, fields) {
        if(results.length == 0){
          connection.release();
          callback(null);
        }else{
          connection.release();
          callback(results);
        }
      });
    });
  }
}
