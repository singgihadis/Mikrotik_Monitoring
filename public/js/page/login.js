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
  $("#form_data").validate({
    submitHandler:function(){
      $("#hidden_password_pendaftaran").val(CryptoJS.MD5($("#password_pendaftaran").val()));
      tambah();
      return false;
    }
  });
  $('#file_npwp').on('change',function(){
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
  });
  $('#file_ktp').on('change',function(){
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
  });
});
function modal_tambah(){
  $("#form_data").trigger("reset");
  $("#img_npwp").attr("src","");
  $("#img_ktp").attr("src","");
  $("#modal_form").modal("show");
}
function tambah(){
  var nama = $("#nama").val();
  var user = $("#user_pendaftaran").val();
  var password = $("#hidden_password_pendaftaran").val();
  var email = $("#email").val();
  var alamat = $("#alamat").val();
  var data = new FormData();
  data.append("id",id);
  data.append("nama",nama);
  data.append("user",user);
  data.append("password",password);
  data.append("email",email);
  data.append("alamat",alamat);
  var is_error = false;
  if($('#file_npwp')[0].files.length > 0){
    data.append('file_npwp', $('#file_npwp')[0].files[0]);
  }else{
    toastr["error"]("Silahkan upload file NPWP");
    is_error = true;
  }
  if($('#file_ktp')[0].files.length > 0){
    data.append('file_ktp', $('#file_ktp')[0].files[0]);
  }else{
    toastr["error"]("Silahkan upload file KTP");
    is_error = true;
  }
  if(is_error == false){
    $("#form_data").loading();
    $.ajax({
      type:'post',
      url:'/ajax/pendaftaran.html',
      cache: false,
      contentType: false,
      processData: false,
      data:data,
      success:function(resp){
        $("#form_data").loading("stop");
        var res = JSON.parse(resp);
        var html = "";
        if(res.is_error){
          if(res.must_login){
            window.location = "/login.html";
          }else{
            toastr["error"](res.msg);
          }
        }else{
          $("#modal_form").modal("hide");
          toastr["success"]("Berhasil mendaftarkan");
        }
      },error:function(){
        $("#form_data").loading("stop");
        toastr["error"]("Silahkan periksa koneksi internet anda");
      }
    });
  }

}
