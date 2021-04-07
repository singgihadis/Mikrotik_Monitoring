$(document).ready(function(){
  $("#form_login").validate({
    submitHandler : function(){
      $("#form_login").loading();
      var host = $("#host").val();
      var port = $("#port").val();
      var user = $("#user").val();
      var password = $("#password").val();
      $.ajax({
        type:'post',
        url:'/ajax/login.html',
        data:{host:host,port:port,user:user,password:password},
        success:function(resp){
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            $("#form_login").loading("stop");
            toastr["error"](res.msg);
          }else{
            window.location = "/dashboard.html";
          }
        },error:function(){
          $("#form_login").loading("stop");
          toastr["error"]("Gagal login, coba beberapa saat lagi");
        }
      });
    }
  });
});
