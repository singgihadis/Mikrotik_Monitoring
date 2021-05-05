$(document).ready(function(){
  $("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
  });
  system_identity();
  global_system_resources();
  router_load();
});
function router_load(){
  $.ajax({
    type:'post',
    url:'/ajax/router_data.html',
    data:{keyword:"",page:"x"},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          var html = "";
          html += "<option value=''>Silahkan tambahkan router</option>";
          $("#select_router").html(html);
          $("#select_router").show();
          $("#select_router").select2({
            theme: "bootstrap"
          });
        }
      }else{
        var server_id_selected = $("#server_id_selected").val();
        var html = "";
        html += "<option value=''>Pilih router</option>";
        $.each(res.data,function(k,v){
          if(server_id_selected == v['id']){
            html += "<option value='" + v['id'] + "' selected='selected'>" + v['nama'] + " - " + v['host'] + "</option>";
          }else{
            html += "<option value='" + v['id'] + "'>" + v['nama'] + " - " + v['host'] + "</option>";
          }
        });
        $("#select_router").html(html);
        $("#select_router").show();
        $("#select_router").select2({
          theme: "bootstrap"
        });
        $("#select_router").change(function(){
          pilih_router();
        });
      }
    },error:function(){
      var html = "";
      html += "<option value=''>Periksa internet anda</option>";
      $("#select_router").html(html);
      $("#select_router").show();
      $("#select_router").select2({
        theme: "bootstrap"
      });
    }
  });
}
function pilih_router(){
  $("body").loading();
  var id = $("#select_router").val();
  $.ajax({
    type:'post',
    url:'/ajax/router_pilih.html',
    data:{id:id},
    success:function(resp){
      $("body").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
          setTimeout(function(){
            window.location.reload();
          },1000);
        }
      }else{
        window.location.reload();
      }
    },error:function(){
      $("body").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
      setTimeout(function(){
        window.location.reload();
      },1000);
    }
  });
}
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
          if(res.msg != ""){
            toastr["error"](res.msg);
          }
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
          if(res.msg != ""){
            toastr["error"](res.msg);
          }
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
