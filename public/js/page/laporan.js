var cur_bln = 0;
var cur_thn = 0;
$(document).ready(function(){
  cur_thn = parseInt(moment().format("YYYY"));
  cur_bln = parseInt(moment().format("M"));
  $("#bulan").val(cur_bln);
  build_tahun();
  $("#bulan").change(function(){
    load_data();
  });
});

function build_tahun(){
  var html = "";
  $("#tahun").val(cur_thn);
  $(".bulan_tahun").html("(" + IndexToMonth(parseInt(cur_bln) - 1) + " " + cur_thn + ")");
  $("#tahun").datepicker({
    format: "yyyy",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true
  }).on("changeYear", function(e) {
    $(".bulan_tahun").html("(" + IndexToMonth(parseInt($("#bulan").val()) - 1) + " " + $("#tahun").val() + ")");
    setTimeout(function(){
      load_data();
    },100);
  });
  load_data();
}
function load_data(){
  $("#listdata").loading();
  var bulan = $("#bulan").val();
  var tahun = $("#tahun").val();
  $.ajax({
    type:'post',
    url:'/ajax/laporan_pembayaran_by_metode_bayar.html',
    data:{bulan:bulan,tahun:tahun},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='6'>" + res.msg + "</td></tr>");
        }
      }else{
        var data = res.data;
        var data_khusus = res.data_khusus;
        var new_data = [];
        if(data.length > 0 && data_khusus.length > 0){
          var data_khusus_match = [];
          $.each(data,function(k,v){
            var is_match = false;
            $.each(data_khusus,function(k2,v2){
              if(v['metode_bayar'] == v2['metode_bayar']){
                data_khusus_match.push(v2['metode_bayar']);
                var total_pembayaran = 0;
                new_data.push({
                  metode_bayar:v['metode_bayar'],
                  jml_transaksi:parseInt(v['jml_transaksi']) + parseInt(v2['jml_transaksi']),
                  jml_pembayaran:parseInt(v['jml_pembayaran']) + parseInt(v2['jml_pembayaran']),
                  biaya_layanan:parseInt(v['biaya_layanan']) + parseInt(v2['biaya_layanan']),
                  biaya_layanan_duitku:parseInt(v['biaya_layanan_duitku']) + parseInt(v2['biaya_layanan_duitku']),
                  total_pembayaran:parseInt(v['jml_pembayaran']) + parseInt(v2['jml_pembayaran']) + parseInt(v['biaya_layanan']) + parseInt(v2['biaya_layanan']) + parseInt(v['biaya_layanan_duitku']) + parseInt(v2['biaya_layanan_duitku'])
                });
                is_match = true;
              }
            });
            if(is_match == false){
              new_data.push(v);
            }
          });
          if(data_khusus_match.length > 0){
            $.each(data_khusus,function(k2,v2){
              if($.inArray(v2['metode_bayar'], data_khusus_match) === -1){
                //found
                new_data.push(v2);
              }
            });
          }else{
            $.each(data_khusus,function(k2,v2){
              new_data.push(v2);
            });
          }
        }else if(data.length > 0){
          $.each(data,function(k,v){
            new_data.push({
              metode_bayar:v['metode_bayar'],
              jml_transaksi:parseInt(v['jml_transaksi']),
              jml_pembayaran:parseInt(v['jml_pembayaran']),
              biaya_layanan:parseInt(v['biaya_layanan']),
              biaya_layanan_duitku:parseInt(v['biaya_layanan_duitku']),
              total_pembayaran:parseInt(v['jml_pembayaran']) + parseInt(v['biaya_layanan']) + parseInt(v['biaya_layanan_duitku'])
            });
          });
        }else if(data_khusus.length > 0){
          $.each(data_khusus,function(k,v){
            new_data.push({
              metode_bayar:v['metode_bayar'],
              jml_transaksi:parseInt(v['jml_transaksi']),
              jml_pembayaran:parseInt(v['jml_pembayaran']),
              biaya_layanan:parseInt(v['biaya_layanan']),
              biaya_layanan_duitku:parseInt(v['biaya_layanan_duitku']),
              total_pembayaran:parseInt(v['jml_pembayaran']) + parseInt(v['biaya_layanan']) + parseInt(v['biaya_layanan_duitku'])
            });
          });
        }
        var total_jml_transaksi = 0;
        var total_jml_pembayaran = 0;
        var total_biaya_layanan = 0;
        var total_biaya_layanan_duitku = 0;
        var total_total_pembayaran = 0;
        $.each(new_data,function(k,v){
          html += "<tr>";
          html += "<td>" + MetodeBayarByKodeNumber(v['metode_bayar']) + "</td>";
          html += "<td>" + FormatAngka(v['jml_transaksi']) + "</td>";
          html += "<td>Rp. " + FormatAngka(v['jml_pembayaran']) + "</td>";
          html += "<td>Rp. " + FormatAngka(v['biaya_layanan']) + "</td>";
          html += "<td>Rp. " + FormatAngka(v['biaya_layanan_duitku']) + "</td>";
          html += "<td>Rp. " + FormatAngka(v['total_pembayaran']) + "</td>";
          html += "</tr>";
          total_jml_transaksi = total_jml_transaksi + parseInt(v['jml_transaksi']);
          total_jml_pembayaran = total_jml_pembayaran + parseInt(v['jml_pembayaran']);
          total_biaya_layanan = total_biaya_layanan + parseInt(v['biaya_layanan']);
          total_biaya_layanan_duitku = total_biaya_layanan_duitku + parseInt(v['biaya_layanan_duitku']);
          total_total_pembayaran = total_total_pembayaran + parseInt(v['total_pembayaran']);
        });
        html += "<tr>";
        html += "<td><b>Total</b></td>";
        html += "<td><b>" + FormatAngka(total_jml_transaksi) + "</b></td>";
        html += "<td><b>Rp. " + FormatAngka(total_jml_pembayaran) + "</b></td>";
        html += "<td><b>Rp. " + FormatAngka(total_biaya_layanan) + "</b></td>";
        html += "<td><b>Rp. " + FormatAngka(total_biaya_layanan_duitku) + "</b></td>";
        html += "<td><b>Rp. " + FormatAngka(total_total_pembayaran) + "</b></td>";
        html += "</tr>";
        $("#listdata").html(html);
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#listdata").html("<tr><td colspan='6'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
