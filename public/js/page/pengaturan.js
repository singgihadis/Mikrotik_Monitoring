$(document).ready(function(){
  $("#form_pengaturan").validate({
    submitHandler:function(){
      $("#form_pengaturan").loading();
      var title = $("#title").val();
      $.ajax({
        type:'post',
        url:'/ajax/pengaturan_simpan.html',
        data:{title:title},
        success:function(resp){
          $("#form_pengaturan").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            toastr["success"]("Berhasil simpan data");
          }
        },error:function(){
          $("#form_pengaturan").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
});
function load_data(with_loading){
  $("#form_pengaturan").loading();
  $.ajax({
    type:'post',
    url:'/ajax/dns_cache.html',
    data:{keyword:keyword,page:page},
    success:function(resp){
      $("#form_pengaturan").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        var data = res.data;
        var title = data['title'];
        $("#title").val(title);
      }
    },error:function(){
      $("#form_pengaturan").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
