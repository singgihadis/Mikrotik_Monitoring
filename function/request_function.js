const request = require("request");
const url = 'http://127.0.0.1:3002'
module.exports = {
  Post: function(method,param,callback){
    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url:url + '' + method,
      form:param
    }, function(error, response, body){
      if(error != null){
        callback(JSON.stringify({'is_error':true,'msg':"Gagal mendapatkan response (msg in api function), " + JSON.stringify(error)}));
      }else{
        callback(body);
      }
    });
  }
}
