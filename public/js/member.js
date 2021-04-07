$(document).ready(function(){
  member_saldo();
});
function member_saldo(){
  $.ajax({
    type:'post',
    url:'/ajax/member_saldo.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        var data = res.data;
        if(data.length > 0){
          saldo = data[0]['saldo'];
          $("#saldo").html("Rp. " + FormatAngka(data[0]['saldo']));
        }else{
          $("#saldo").html("Rp. " + 0);
        }
      }
    },error:function(){
      toastr["error"]("Gagal memuat data, coba lagi nanti");
    }
  });
}
