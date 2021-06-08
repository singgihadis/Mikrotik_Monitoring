var page = 1;
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  total_tagihan();
  build_tahun();
  load_data();
});
function build_tahun(){
  var html = "";
  var tahun_sekarang = parseInt(moment().format("YYYY"));
  $("#tahun").val(tahun_sekarang);
  $("#tahun").datepicker({
    format: "yyyy",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true
  }).on("changeYear", function(e) {
    page = 1;
    load_data();
  });;
}
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  var tahun = $("#tahun").val();
  $.ajax({
    type:'post',
    url:'/ajax/pembayaran.html',
    data:{keyword:keyword,tahun:tahun,page:page},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='15'>" + res.msg + "</td></tr>");
          $("#info_page").html("0 - 0 dari 0");
        }
      }else{
        var data = res.data;
        var html = "";
        var no = (page * 10) - 9;
        var first = no;
        $.each(data,function(k,v){
          if(k < 10){
            var bulan = v['bulan'];
            var arr_bulan = bulan.split(",");
            html += "<tr>";
            html += "<td>" +  no + "</td>";
            html += "<td>" +  v['nama_server'] + "</td>";
            html += "<td><a href='javascript:void(0);' class='text-dark' onclick='modal_detail(this)' data-name='" + v['name'] +  "' data-password='" + v['password'] +  "' data-profile='" + v['profile'] +  "' data-nama='" + v['nama'] + "' data-alamat='" + v['alamat'] + "' data-no-wa='" + v['no_wa'] + "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "'>" + v['nama'] + "</a></td>";
            for(var a=0;a<12;a++){
              var is_bayar = "<span class='fa fa-times-circle text-danger'></span>";
              if(arr_bulan.indexOf((a + 1).toString()) != -1){
                is_bayar = "<span class='fa fa-check text-success'></span>";
              }
              html += "<td class='text-center'>" + is_bayar + "</td>";
            }
            html += "</tr>";
            no++;
          }
        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
        $("#info_page").html(first + " - " + (no - 1) + " dari " + FormatAngka(res.total));
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#info_page").html("0 - 0 dari 0");
      $("#listdata").html("<tr><td colspan='15'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function total_tagihan(){
  $.ajax({
    type:'post',
    url:'/ajax/total_tagihan.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      var total_tagihan = 0;
      var total_dibayar = 0;
      var total_belum_dibayar = 0;
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        total_tagihan = res['total'];
        total_dibayar = res['total_dibayar'];
        total_belum_dibayar = res['total_belum_dibayar'];
      }
      $("#total").html("Rp. " + FormatAngka(total_tagihan));
      $("#total_dibayar").html("Rp. " + FormatAngka(total_dibayar));
      $("#total_belum_dibayar").html("Rp. " + FormatAngka(total_belum_dibayar));
    },error:function(){

    }
  });
}
function modal_detail(itu){
  var name = $(itu).attr("data-name");
  var password = $(itu).attr("data-password");
  var profile = $(itu).attr("data-profile");
  var nama = $(itu).attr("data-nama");
  var alamat = $(itu).attr("data-alamat");
  var no_wa = $(itu).attr("data-no-wa");
  var nominal_pembayaran = $(itu).attr("data-nominal-pembayaran");
  $("#name").html(name);
  $("#password").html(password);
  $("#profile").html(profile);
  $("#nama").html(nama);
  $("#alamat").html(alamat);
  $("#no_wa").html(no_wa);
  $("#nominal_pembayaran").html("Rp. " + FormatAngka(nominal_pembayaran));
  $("#modal_detail").modal("show");
}
function html_pagination(jmldata){
  var html_pagination = "";
  html_pagination += "<div class='d-inline-block'>";
  html_pagination += "  <ul class='pagination'>";

  if(page == 1){
    //Isprev false
    html_pagination += "    <li class='page-item disabled'>";
    html_pagination += "      <a class='page-link text-secondary' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-secondary'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }else{
    //Isprev true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body prevpage' data-page='" + (parseInt(page) - 1) + "' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-body'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }
  html_pagination += "    <li class='page-item disabled'><a class='page-link text-body' href='javascript:void(0);'>" + page + "</a></li>";
  if(jmldata > 5){
    //Isnext true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body nextpage' data-page='" + (parseInt(page) + 1) + "' href='javascript:void(0);'>";
    html_pagination += "        Selanjutnya <span class='fa fa-chevron-right text-body'>&nbsp;</span>";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }else{
    //Isnext false
    html_pagination += "    <li class='page-item disabled'>";
    html_pagination += "      <a class='page-link text-secondary' href='javascript:void(0);'>";
    html_pagination += "        Selanjutnya <span class='fa fa-chevron-right text-secondary'>&nbsp;</span>";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }
  html_pagination += "  </ul>";
  html_pagination += "</div>";
  $("#pagination").html(html_pagination);
  trigger_pagination();
}
function trigger_pagination(){
  $(".prevpage").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data(true);
  });
  $(".nextpage").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data(true);
  });
}
