//use mysql database
const mysql = require('mysql2');
const fs = require('fs');

//konfigurasi koneksi
var db_config = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'mikrotik_monitoring',
  dateStrings: 'date',
  connectionLimit: 10
};
var pool = mysql.createPool(db_config);
module.exports = pool;
