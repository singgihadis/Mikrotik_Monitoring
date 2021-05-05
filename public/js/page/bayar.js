var page = 1;
var is_sukses = false;
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  build_tahun();
  load_data();
  $("#form_bayar").validate({
    submitHandler : function(){
      $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
      var bulan = $("#bulan").val();
      var id = $("#id").val();
      var is_bayar = $("#is_bayar").val();
      var tahun = $("#tahun").val();
      var metode_bayar = "";
      if($("input[name='cr_metode_bayar']").attr("id") == "cr_transfer"){
        metode_bayar = "1";
      }else{
        metode_bayar = "2";
      }
      var bank_id = $("#bank").val();
      var password = $("#hidden_password").val();
      if(tahun == ""){
        toastr["error"]("Silahkan isikan tahun pada filter data terlebih dahulu");
      }else{
        $("#form_bayar").loading();
        $.ajax({
          type:'post',
          url:'/ajax/pembayaran_bayar.html',
          data:{id:id,bulan:bulan,tahun:tahun,is_bayar:is_bayar,metode_bayar:metode_bayar,bank_id:bank_id,password:password},
          success:function(resp){
            $("#form_bayar").loading("stop");
            var res = JSON.parse(resp);
            var html = "";
            if(res.is_error){
              if(res.must_login){
                window.location = "/login.html";
              }else{
                toastr["error"](res.msg);
              }
            }else{
              if(is_bayar == "1"){
                toastr["success"]("Berhasil melakukan pembayaran");
              }else{
                toastr["success"]("Berhasil membatalkan pembayaran");
              }
              is_sukses = true;
              $('#modal_bayar').modal("hide");
            }
          },error:function(){
            $("#form_bayar").loading("stop");
            toastr["error"]("Silahkan periksa koneksi internet anda");
          }
        });
      }

    }
  });
  dropdown_bank();
  $("input[name='cr_metode_bayar']").change(function(){
    if($(this).attr("id") == "cr_transfer"){
      $("#div_bank").show();
    }else{
      $("#div_bank").hide();
    }
  });
});
function dropdown_bank(){
  $.ajax({
    type:'post',
    url:'/ajax/bank_data.html',
    data:{keyword:"",page:"x"},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#bank").html("<option value=''>" + res.msg + "</option>");
          $("#bank").select2({
            theme: "bootstrap"
          });
        }
      }else{
        var html = "";
        $.each(res.data,function(k,v){
          html += "<option value='" + v['id'] + "'>" + v['nama'] + " - " + v['no_rekening'] + "</option>";
        });
        $("#bank").html(html);
        $("#bank").select2({
          theme: "bootstrap"
        });
      }
    },error:function(){
      $("#bank").html("<option value=''>" + res.msg + "</option>");
      $("#bank").select2({
        theme: "bootstrap"
      });
    }
  });
}
function build_tahun(){
  var html = "";
  var tahun_sekarang = parseInt(moment().format("YYYY"));
  $("#tahun").val(tahun_sekarang);
  $("#tahun").datepicker({
    format: "yyyy",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true
  });
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
          $("#listdata").html("<tr><td colspan='14'>" + res.msg + "</td></tr>");
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
            html += "<td><a href='javascript:void(0);' class='text-dark' onclick='modal_detail(this)' data-name='" + v['name'] +  "' data-password='" + v['password'] +  "' data-profile='" + v['profile'] +  "' data-nama='" + v['nama'] + "' data-alamat='" + v['alamat'] + "' data-no-wa='" + v['no_wa'] + "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "'>" + v['nama'] + "</a></td>";
            for(var a=0;a<12;a++){
              var html_switch = "";
              if(arr_bulan.indexOf((a + 1).toString()) != -1){
                html_switch += "<div class='custom-control custom-switch'>";
                html_switch += "  <input type='checkbox' class='custom-control-input cbk-bayar' data-id='" + v['id'] + "' data-bulan='" + (a + 1) + "' data-nama='" + v['nama'] + "' data-profile='" + v['profile'] +  "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "' id='customSwitch" + k + " " + a + "' checked>";
                html_switch += "  <label class='custom-control-label' data-bulan='" + (a + 1) + "' for='customSwitch" + k + " " + a + "'></label>";
                html_switch += "</div>";
              }else{
                html_switch += "<div class='custom-control custom-switch'>";
                html_switch += "  <input type='checkbox' class='custom-control-input cbk-bayar' data-id='" + v['id'] + "' data-bulan='" + (a + 1) + "' data-nama='" + v['nama'] + "' data-profile='" + v['profile'] +  "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "' id='customSwitch" + k + " " + a + "'>";
                html_switch += "  <label class='custom-control-label' data-bulan='" + (a + 1) + "' for='customSwitch" + k + " " + a + "'></label>";
                html_switch += "</div>";
              }

              html += "<td class='text-center'>" + html_switch + "</td>";
            }
            html += "</tr>";
            no++;
          }
        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
        $("#info_page").html(first + " - " + (no - 1) + " dari " + FormatAngka(res.total));

        $(".cbk-bayar").click(function(){
          var nama = $(this).attr("data-nama");
          var profile = $(this).attr("data-profile");
          var nominal = $(this).attr("data-nominal-pembayaran");
          var bulan = $(this).attr("data-bulan");
          var id = $(this).attr("data-id");
          $("#nama_bayar").html(nama);
          $("#profile_bayar").html(profile);
          $("#nominal_bayar").html("Rp. " + FormatAngka(nominal));
          $("#bulan").val(bulan);
          $("#id").val(id);
          var is_bayar = "0";
          if($(this).is(":checked")){
            is_bayar = "1";
          }else{
            is_bayar = "0";
          }
          $("#is_bayar").val(is_bayar);
          is_sukses = false;
          $('#modal_bayar').unbind();
          $("#modal_bayar").modal("show");
          var itu = this;
          $('#modal_bayar').on('hidden.bs.modal', function () {
            var is_bayar = $("#is_bayar").val();
            if(!is_sukses){
              if(is_bayar == "1"){
                $(itu).prop("checked",false);
              }else{
                $(itu).prop("checked",true);
              }
            }
          });
        });
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#info_page").html("0 - 0 dari 0");
      $("#listdata").html("<tr><td colspan='14'>Silahkan periksa koneksi internet anda</td></tr>");
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
  $("#password_detail").html(password);
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
