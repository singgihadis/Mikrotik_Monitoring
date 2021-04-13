$(document).ready(function(){
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });
  system_identity();
  global_system_resources();
});
function system_identity(){
  $.ajax({
    type:'post',
    url:'/ajax/system_identity.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        var data = res.data[0];
        var nama = data['nama'];
        $("#nama_server").html(nama);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function global_system_resources(){
  $.ajax({
    type:'post',
    url:'/ajax/system_resources.html',
    data:{},
    success:function(resp){
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
        $("#uptime").html(UptimeFix(data['uptime']));
        $("#board_name").html("Board name : " + data['boardName']);
        setTimeout(function(){
          global_system_resources();
        },1000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
