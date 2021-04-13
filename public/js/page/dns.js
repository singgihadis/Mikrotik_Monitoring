var page = 1;
$(document).ready(function(){
  load_data();
});
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/dns_cache.html',
    data:{keyword:keyword,page:page},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='5'>" + res.msg + "</td></tr>");
        }
      }else{
        var data = res.data;
        var html = "";
        $.each(data,function(k,v){
          if(k < 10){
            html += "<tr>";
            html += "<td>" +  (k + 1) + "</td>";
            html += "<td>" + v['name'] + "</td>";
            html += "<td>" + v['type'] + "</td>";
            html += "<td>" + v['data'] + "</td>";
            html += "<td class='text-nowrap'>" + ParseDNSCacheTime(v['ttl']) + "</td>";
            html += "</tr>";
          }
        });
        $("#listdata").html(html);
        $("#table_dns_cache").DataTable({
          "language": {
              "lengthMenu": "Menampilkan _MENU_ data per halaman",
              "zeroRecords": "Data tidak tersedia",
              "info": "Menampilkan _PAGE_ dari _PAGES_ halaman",
              "infoEmpty": "",
              "infoFiltered": "(filtered from _MAX_ total records)"
          }
        });
      }
    },error:function(){
      $("#listdata").html("<tr><td colspan='5'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
