$(document).ready(function(){
  $('#file_favicon').on('change',function(){
               var fileName = $(this).val();
               $(this).next('.custom-file-label').html(fileName);
  });
  $('#file_logo').on('change',function(){
               var fileName = $(this).val();
               $(this).next('.custom-file-label').html(fileName);
  });
  $("#form_pengaturan").validate({
    submitHandler:function(){
      $("#form_pengaturan").loading();
      var title = $("#title").val();
      var bank = $("#bank").val();
      var website = $("#website").val();
      var email = $("#email").val();
      var no_wa = $("#no_wa").val();
      var data = new FormData();
      data.append("title",title);
      data.append("bank",bank);
      data.append("website",website);
      data.append("email",email);
      data.append("no_wa",no_wa);
      if($('#file_favicon')[0].files.length > 0){
        data.append('favicon', $('#file_favicon')[0].files[0]);
      }
      if($('#file_logo')[0].files.length > 0){
        data.append('logo', $('#file_logo')[0].files[0]);
      }
      $.ajax({
        type:'post',
        url:'/ajax/pengaturan_simpan.html',
        cache: false,
        contentType: false,
        processData: false,
        data:data,
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
            setTimeout(function(){
              window.location.reload();
            },1000);
          }
        },error:function(){
          $("#form_pengaturan").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  load_data();
});
function load_data(){
  $("#form_pengaturan").loading();
  $.ajax({
    type:'post',
    url:'/ajax/pengaturan.html',
    data:{},
    success:function(resp){
      $("#form_pengaturan").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        var data = res.data[0];
        $("#title").val(data['title']);
        if(data['favicon'] != ""){
          $("#favicon").attr("src",data['favicon']);
        }
        if(data['logo'] != ""){
          $("#logo").attr("src",data['logo']);
        }
        $("#bank").val(data['bank']);
        $("#website").val(data['website']);
        $("#email").val(data['email']);
        $("#no_wa").val(data['no_wa']);
      }
    },error:function(){
      $("#form_pengaturan").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
