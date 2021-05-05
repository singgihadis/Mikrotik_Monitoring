$(document).ready(function(){
  $("#password").keyup(function(){
    $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
  });
  $("#password").blur(function(){
    $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
  });
  $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
  $("#form_login").validate({
    submitHandler : function(){
      $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
      $("#form_login").loading();
      var user = $("#user").val();
      var password = $("#hidden_password").val();
      $.ajax({
        type:'post',
        url:'/ajax/login.html',
        data:{user:user,password:password},
        success:function(resp){
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            $("#form_login").loading("stop");
            toastr["error"](res.msg);
          }else{
            window.location = "/router.html";
          }
        },error:function(){
          $("#form_login").loading("stop");
          toastr["error"]("Gagal login, coba beberapa saat lagi");
        }
      });
    }
  });
});
