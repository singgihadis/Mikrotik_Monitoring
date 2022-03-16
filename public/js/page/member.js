var page = 1;
var data_member_lost = [];
var page_member_lost = 1;
$(document).ready(function(){
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  $("#keyword_member_lost").keyup(function(e){
    render_data_member_lost();
  });
  $("#btn_prev_member_lost").click(function(){
    page_member_lost = page_member_lost - 1;
    render_data_member_lost();
  });
  $("#btn_next_member_lost").click(function(){
    page_member_lost = page_member_lost + 1;
    render_data_member_lost();
  });
  total_member();
  load_data();
  $("#form_member").validate({
    submitHandler:function(){
      $("#form_member").loading();
      var id = $("#id").val();
      var nama = $("#nama").val();
      var alamat = $("#alamat").val();
      var no_wa = $("#no_wa").val();
      var nominal_pembayaran = StrToNumber($("#nominal_pembayaran").val());
      var awal_tagihan_bulan = $("#awal_tagihan_bulan").val();
      var awal_tagihan_tahun = $("#awal_tagihan_tahun").val();
      var email = $("#email").val();
      var is_berhenti_langganan = $("input[name='is_berhenti_langganan']:checked").val();
      var bulan_berhenti_langganan = "0";
      var tahun_berhenti_langganan = "0";
      if(is_berhenti_langganan == "1"){
        bulan_berhenti_langganan = $("#bulan_berhenti_langganan").val();
        tahun_berhenti_langganan = $("#tahun_berhenti_langganan").val();
      }
      var master_paket_id = $("#master_paket_id").val();
      $.ajax({
        type:'post',
        url:'/ajax/member_simpan.html',
        data:{id:id,nama:nama,alamat:alamat,no_wa:no_wa,email:email,nominal_pembayaran:nominal_pembayaran,awal_tagihan_bulan:awal_tagihan_bulan,awal_tagihan_tahun:awal_tagihan_tahun,is_berhenti_langganan:is_berhenti_langganan,bulan_berhenti_langganan:bulan_berhenti_langganan,tahun_berhenti_langganan:tahun_berhenti_langganan,master_paket_id:master_paket_id},
        success:function(resp){
          $("#form_member").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            $("#modal_update").modal("hide");
            toastr["success"]("Berhasil menambahkan");
            load_data();
          }
        },error:function(){
          $("#form_member").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  $("#form_member_sq").validate({
    submitHandler : function(){
      $("#form_member_sq").loading();
      var id = $("#id_sq").val();
      var nama = $("#nama_sq").val();
      var alamat = $("#alamat_sq").val();
      var no_wa = $("#no_wa_sq").val();
      var email = $("#email_sq").val();
      var username = $("#username_sq").val();
      var password = $("#password_sq").val();
      var nominal_pembayaran = StrToNumber($("#nominal_pembayaran_sq").val());
      var awal_tagihan_bulan = $("#awal_tagihan_bulan_sq").val();
      var awal_tagihan_tahun = $("#awal_tagihan_tahun_sq").val();
      var is_berhenti_langganan = $("input[name='is_berhenti_langganan_sq']:checked").val();
      var bulan_berhenti_langganan = "0";
      var tahun_berhenti_langganan = "0";
      if(is_berhenti_langganan == "1"){
        bulan_berhenti_langganan = $("#bulan_berhenti_langganan_sq").val();
        tahun_berhenti_langganan = $("#tahun_berhenti_langganan_sq").val();
      }
      var master_paket_id = $("#master_paket_id_sq").val();
      $.ajax({
        type:'post',
        url:'/ajax/member_simpan_sq.html',
        data:{
          simple_queue_id:id,
          nama:nama,
          alamat:alamat,
          no_wa:no_wa,
          email:email,
          username:username,
          password:password,
          nominal_pembayaran:nominal_pembayaran,
          awal_tagihan_bulan:awal_tagihan_bulan,
          awal_tagihan_tahun:awal_tagihan_tahun,
          is_berhenti_langganan:is_berhenti_langganan,
          bulan_berhenti_langganan:bulan_berhenti_langganan,
          tahun_berhenti_langganan:tahun_berhenti_langganan,
          master_paket_id:master_paket_id
        },
        success:function(resp){
          $("#form_member_sq").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            $("#modal_sq").modal("hide");
            toastr["success"]("Berhasil menambahkan");
            load_data();
          }
        },error:function(){
          $("#form_member_sq").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  $("input[name='is_berhenti_langganan']").change(function(){
    if($(this).val() == "1"){
      $("#fg_berhenti_langganan").show();
      $("#bulan_berhenti_langganan").val("");
      $("#tahun_berhenti_langganan").val("");
    }else{
      $("#fg_berhenti_langganan").hide();
    }
  });
  $("input[name='is_berhenti_langganan_sq']").change(function(){
    if($(this).val() == "1"){
      $("#fg_berhenti_langganan_sq").show();
      $("#bulan_berhenti_langganan_sq").val("");
      $("#tahun_berhenti_langganan_sq").val("");
    }else{
      $("#fg_berhenti_langganan_sq").hide();
    }
  });
  $("#master_paket_id").change(function(){
    var harga = $("#master_paket_id option:selected").attr("data-harga");
    $("#harga_paket").val(FormatAngka(harga));
    trigger_nominal_pembayaran_total();
  });
  $("#harga_paket").keyup(function(){
    $("#harga_paket").val(FormatAngka($("#harga_paket").val()));
    trigger_nominal_pembayaran_total();
  });
  $("#master_paket_id_sq").change(function(){
    var harga = $("#master_paket_id_sq option:selected").attr("data-harga");
    $("#harga_paket_sq").val(FormatAngka(harga));
    trigger_nominal_pembayaran_total_sq();
  });
  $("#harga_paket_sq").keyup(function(){
    $("#harga_paket_sq").val(FormatAngka($("#harga_paket_sq").val()));
    trigger_nominal_pembayaran_total_sq();
  });
});
function search_member_lost(is_search_lost){
  if(is_search_lost == "1"){
    $("#modal_update_dialog").addClass("modal-xl");
    $("#form_member").hide();
    $("#member_lost").show();
    load_data_member_lost();
  }else{
    $("#member_lost").hide();
    $("#form_member").show();
    $("#modal_update_dialog").removeClass("modal-xl");
  }
}
function load_data_member_lost(){
  $("#listdatamemberlost").loading();
  var keyword = $("#keyword_member_lost").val();
  $.ajax({
    type:'post',
    url:'/ajax/member_lost_get.html',
    data:{keyword:keyword},
    success:function(resp){
      $("#listdatamemberlost").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdatamemberlost").html("<tr><td colspan='10'>" + res.msg + "</td></tr>");
          $("#info_page_member_lost").html("0 - 0 dari 0");
        }
      }else{
        data_member_lost = res.data;
        render_data_member_lost();
      }
    },error:function(){
      $("#listdatamemberlost").loading("stop");
      $("#info_page_member_lost").html("0 - 0 dari 0");
      $("#listdatamemberlost").html("<tr><td colspan='10'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function render_data_member_lost(){
  var keyword = $("#keyword_member_lost").val();
  var data = data_member_lost;
  var total_data = data.length;
  var html = "";
  var data_filter= [];
  $.each(data,function(k,v){
    if(keyword == "" || (keyword != "" && (v['nama'].indexOf(keyword) != -1 || v['alamat'].indexOf(keyword) != -1 || v['no_wa'].indexOf(keyword) != -1 || v['email'].indexOf(keyword) != -1))){
      data_filter.push(v);
    }
  });
  data = data_filter;
  var limit_start = (page_member_lost * 10) - 10;
  var limit_end = limit_start + 10;
  var dari = limit_start + 1;
  var ke = limit_start;
  $.each(data,function(k,v){
    if(k >= limit_start && k < limit_end){
      html += "<tr>";
      html += "<td>" + v['nama'] + "</td>";
      html += "<td>" + v['alamat'] + "</td>";
      html += "<td>" + v['no_wa'] + "</td>";
      html += "<td>" + v['email'] + "</td>";
      html += "<td>" + v['nama_paket'] + "</td>";
      html += "<td>Rp. " + FormatAngka(v['nominal_pembayaran']) + "</td>";
      html += "<td>" + IndexToMonth(parseInt(v['awal_tagihan_bulan']) + 1) + " " + v['awal_tagihan_tahun'] + "</td>";
      if(v['is_berhenti_langganan'] == "1"){
        html += "<td class='text-center'>" + IndexToMonth(parseInt(v['bulan_berhenti_langganan']) + 1) + " " + v['tahun_berhenti_langganan'] + "</td>";
      }else{
        html += "<td class='text-center'>-</td>";
      }
      html += "<td><a onclick='pilih_lost_member(this)' data-id='" + v['id'] +"' href='javascript:void(0);' class='btn btn-sm btn-danger text-nowrap'><span class='fa fa-hand-pointer-o'></span> Pilih</a></td>";
      html += "</tr>";
      ke++;
    }
  });
  $("#listdatamemberlost").html(html);
  $("#info_page_member_lost").html(dari + " - " + ke + " dari " + total_data);
  $("#page_member_lost_preview").html(page_member_lost);
  if(page_member_lost == 1){
    $("#btn_prev_member_lost").attr("disabled","disabled");
  }else{
    $("#btn_prev_member_lost").removeAttr("disabled");
  }
  if(ke < total_data){
    $("#btn_next_member_lost").removeAttr("disabled");
  }else{
    $("#btn_next_member_lost").attr("disabled","disabled");
  }
}
function pilih_lost_member(itu){
  var member_id = $(itu).attr("data-id");
  var ppp_secret_id = $("#id").val();
  $.confirm({
    title: 'Konfirmasi',
    content: 'Apa anda yakin data tersebut cocok dengan PPP Secret yang anda pilih tadi ?',
    buttons: {
        cancel: {
          text: 'Batal',
          btnClass: 'btn-light',
          action: function(){

          }
        },
        confirm: {
          text: 'Konfirmasi',
          btnClass: 'btn-blue',
          action: function(){
            $(itu).parent().parent().loading();
            $.ajax({
              type:'post',
              url:'/ajax/member_lost_recovery.html',
              data:{id:member_id,ppp_secret_id:ppp_secret_id},
              success:function(resp){
                $(itu).parent().parent().loading("stop");
                var res = JSON.parse(resp);
                var html = "";
                if(res.is_error){
                  if(res.must_login){
                    window.location = "/login.html";
                  }else{
                    toastr["error"](res.msg);
                  }
                }else{
                  toastr["success"]("Berhasil merecovery data");
                  page_member_lost = 1;
                  load_data_member_lost();
                }
              },error:function(){
                $(itu).parent().parent().loading("stop");
                toastr["error"]("Silahkan periksa koneksi internet anda");
              }
            });
          }
        }
    }
  });
}
function trigger_nominal_pembayaran_total(){
  var nominal_pembayaran = StrToNumber($("#harga_paket").val());
  var ppn = parseInt((10 / 100) * nominal_pembayaran);
  var nominal_pembayaran_total = nominal_pembayaran + ppn;
  $("#ppn").val(FormatAngka(ppn));
  $("#nominal_pembayaran").val(FormatAngka(nominal_pembayaran_total));
}
function trigger_nominal_pembayaran_total_sq(){
  var nominal_pembayaran = StrToNumber($("#harga_paket_sq").val());
  var ppn = parseInt((10 / 100) * nominal_pembayaran);
  var nominal_pembayaran_total = nominal_pembayaran + ppn;
  $("#ppn_sq").val(FormatAngka(ppn));
  $("#nominal_pembayaran_sq").val(FormatAngka(nominal_pembayaran_total));
}
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/member.html',
    data:{keyword:keyword,page:page},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='10'>" + res.msg + "</td></tr>");
          $("#info_page").html("0 - 0 dari 0");
        }
      }else{
        var data = res.data;
        var html = "";
        var no = (page * 10) - 9;
        var first = no;
        $.each(data,function(k,v){
          if(k < 10){
            var is_berlangganan = "";
            var color_belum_update = "";
            if(v['awal_tagihan_bulan'] == null){
              color_belum_update = "bg-warning-semi-transparent";
            }else{
              if(v['is_berhenti_langganan'] == "1"){
                is_berlangganan = "<span class='badge badge-dark'>Berhenti</span>";
              }else{
                is_berlangganan = "<span class='badge badge-success'>Aktif</span>";
              }
            }
            html += "<tr>";
            html += "<td>" +  no + "</td>";
            html += "<td>" + v['nama_server'] + "</td>";
            if(v['type'] == "1"){
              //PPP
              html += "<td>" + v['resource_name'] + "</td>";
              html += "<td>" + v['profile'] + "</td>";
            }else{
              //Simple Queue
              html += "<td></td>";
              html += "<td>" + v['resource_name'] + "</td>";
            }
            if(v['awal_tagihan_bulan'] == null){
              html += "<td class='" + color_belum_update + "' colspan='5'>Silahkan update data ini dengan klik tombol edit di samping kanan anda</td>";
            }else{
              html += "<td class='" + color_belum_update + "'>" + v['nama'] + "</td>";
              html += "<td class='" + color_belum_update + "'>" + v['no_wa'] + "</td>";
              html += "<td class='" + color_belum_update + "'>" + v['alamat'] + "</td>";
              html += "<td class='" + color_belum_update + "'>";
              html += "Rp. " + FormatAngka(v['nominal_pembayaran']) + "";
              html += "</td>";
              html += "<td class='" + color_belum_update + "'>" + is_berlangganan + "</td>";
            }
            html += "<td class='text-center'>";
            var id = "";
            if(v['type'] == "1"){
              id = v['ppp_secret_id'];
            }else{
              id = v['simple_queue_id'];
            }
            html += "<a onclick='modal_update(this)' data-belum-update='" + (color_belum_update!=""?"1":"0") + "' data-master-paket-id='" + v['master_paket_id'] + "' data-simple-queue-username='" + v['simple_queue_username'] +"' data-simple-queue-password='" + v['simple_queue_password'] + "' data-type='" + v['type'] + "' data-id='" + id + "' data-nama='" + v['nama'] + "' data-alamat='" + v['alamat'] + "' data-awal-tagihan-bulan='" + (v['awal_tagihan_bulan']!=null?v['awal_tagihan_bulan']:"") + "' data-awal-tagihan-tahun='" + (v['awal_tagihan_tahun']!=null?v['awal_tagihan_tahun']:'') + "' data-no-wa='" + v['no_wa'] + "' data-email='" + v['email'] + "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "' data-is-berhenti-langganan='" + v['is_berhenti_langganan'] + "' data-bulan-berhenti-langganan='" + v['bulan_berhenti_langganan'] + "' data-tahun-berhenti-langganan='" + v['tahun_berhenti_langganan'] + "' href='javascript:void(0);' class='btn btn-light'><span class='fa fa-edit'></span></a>";
            if(v['type'] == "1"){
              html += " <a href='/member/detail/1/" + v['ppp_secret_id'] + "/" + v['server_id'] + ".html' class='btn btn-primary'><span class='fa fa-list'></span></a>";
            }else{
              html += " <a href='/member/detail/2/" + v['simple_queue_id'] + "/" + v['server_id'] + ".html' class='btn btn-primary'><span class='fa fa-list'></span></a>";
            }
            html += "</td>";
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
      $("#listdata").html("<tr><td colspan='10'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}

function total_member(){
  $.ajax({
    type:'post',
    url:'/ajax/total_member.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      var total = 0;
      var total_belum_update = 0;
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        total = res['total'];
        total_belum_update = res['total_belum_update'];
      }
      $("#total").html(FormatAngka(total));
      $("#total_belum_update").html(FormatAngka(total_belum_update));
    },error:function(){

    }
  });
}
function modal_update(itu){
  var type = $(itu).attr("data-type");
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  var alamat = $(itu).attr("data-alamat");
  var no_wa = $(itu).attr("data-no-wa");
  var awal_tagihan_bulan = $(itu).attr("data-awal-tagihan-bulan");
  var awal_tagihan_tahun = $(itu).attr("data-awal-tagihan-tahun");
  var nominal_pembayaran = $(itu).attr("data-nominal-pembayaran");
  var is_berhenti_langganan = $(itu).attr("data-is-berhenti-langganan");
  var bulan_berhenti_langganan = $(itu).attr("data-bulan-berhenti-langganan");
  var tahun_berhenti_langganan = $(itu).attr("data-tahun-berhenti-langganan");
  var master_paket_id = $(itu).attr("data-master-paket-id");
  var email = $(itu).attr("data-email");
  var is_belum_update = $(itu).attr("data-belum-update");
  if(is_belum_update == "1"){
    $("#ask_member_lost").show();
  }else{
    $("#ask_member_lost").hide();
  }
  if(type == "1"){
    $("#form_member").trigger("reset");
    $("#id").val(id);
    $("#nama").val(nama);
    $("#alamat").val(alamat);
    $("#no_wa").val(no_wa);
    $("#email").val(email);
    dropdown_paket(master_paket_id);
    $("#nominal_pembayaran").val(FormatAngka(nominal_pembayaran));
    var harga_paket = parseInt((100/110) * nominal_pembayaran);
    var ppn = nominal_pembayaran - harga_paket;
    $("#ppn").val(FormatAngka(ppn));
    $("#harga_paket").val(FormatAngka(harga_paket));
    $("#awal_tagihan_bulan").val(awal_tagihan_bulan);
    $("#awal_tagihan_tahun").val(awal_tagihan_tahun);
    if(is_berhenti_langganan == "1"){
      $("#fg_berhenti_langganan").show();
      $("#is_berhenti_langganan_ya").prop("checked",true);
      $("#bulan_berhenti_langganan").val(bulan_berhenti_langganan);
      $("#tahun_berhenti_langganan").val(tahun_berhenti_langganan);
    }else{
      $("#fg_berhenti_langganan").hide();
      $("#is_berhenti_langganan_tidak").prop("checked",true);
      $("#bulan_berhenti_langganan").val("");
      $("#tahun_berhenti_langganan").val("");
    }
    $("#nominal_pembayaran_ppn").val("");
    $("#nominal_pembayaran_total").val("");
    $("#modal_update").modal("show");
    search_member_lost(0);
  }else{
    var simple_queue_username = $(itu).attr("data-simple-queue-username");
    var simple_queue_password = $(itu).attr("data-simple-queue-password");
    $("#form_member_sq").trigger("reset");
    $("#id_sq").val(id);
    $("#nama_sq").val(nama);
    $("#alamat_sq").val(alamat);
    $("#no_wa_sq").val(no_wa);
    $("#email_sq").val(email);
    $("#username_sq").val(simple_queue_username);
    $("#password_sq").val(simple_queue_password);
    dropdown_paket(master_paket_id,"master_paket_id_sq");
    $("#nominal_pembayaran_sq").val(FormatAngka(nominal_pembayaran));
    var harga_paket = parseInt((100/110) * nominal_pembayaran);
    var ppn = nominal_pembayaran - harga_paket;
    $("#ppn_sq").val(FormatAngka(ppn));
    $("#harga_paket_sq").val(FormatAngka(harga_paket));
    $("#awal_tagihan_bulan_sq").val(awal_tagihan_bulan);
    $("#awal_tagihan_tahun_sq").val(awal_tagihan_tahun);
    if(is_berhenti_langganan == "1"){
      $("#fg_berhenti_langganan_sq").show();
      $("#is_berhenti_langganan_ya_sq").prop("checked",true);
      $("#bulan_berhenti_langganan_sq").val(bulan_berhenti_langganan);
      $("#tahun_berhenti_langganan_sq").val(tahun_berhenti_langganan);
    }else{
      $("#fg_berhenti_langganan_sq").hide();
      $("#is_berhenti_langganan_tidak_sq").prop("checked",true);
      $("#bulan_berhenti_langganan_sq").val("");
      $("#tahun_berhenti_langganan_sq").val("");
    }
    $("#nominal_pembayaran_ppn_sq").val("");
    $("#nominal_pembayaran_total_sq").val("");
    $("#modal_sq").modal("show");
  }
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
  if(jmldata > 10){
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
function dropdown_paket(id_paket,elm="master_paket_id"){
  $.ajax({
    type:'post',
    url:'/ajax/master_paket.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          // toastr["error"](res.msg);
          var html = "<option data-harga='0' value=''>Pilih Paket</option>";
          $("#" + elm).html(html);
        }
      }else{
        var html = "<option data-harga='0' value=''>Pilih Paket</option>";
        $.each(res.data,function(k,v){
          if(id_paket == v['id']){
            html += "<option data-harga='" + v['harga'] + "' value='" + v['id'] + "' selected='selected'>" + v['nama'] + "</option>";
          }else{
            html += "<option data-harga='" + v['harga'] + "' value='" + v['id'] + "'>" + v['nama'] + "</option>";
          }
        });
        $("#" + elm).html(html);
        $("#" + elm).select2({
          theme: "bootstrap"
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
