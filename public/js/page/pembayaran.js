var page = 1;
var page2 = 1;
var cur_bln = 0;
var cur_thn = 0;
var data_statistik_total = [];
var statistik_chart_render = null;
var new_data_statistik_total = [];
var total_belum_dibayar = 0;
var total_tagihan = 0;
var total_dibayar = 0;
var total_tagihan_ppn = 0;
$(document).ready(function(){
  cur_thn = parseInt(moment().format("YYYY"));
  cur_bln = parseInt(moment().format("M"));
  $("#bulan").val(cur_bln);
  $("#bulan").change(function(){
    widget_total();
  });
  $('[data-toggle="tooltip"]').tooltip();
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  $("#form_data_tagihan").validate({
    submitHandler:function(){
      page2 = 1;
      load_data_tagihan();
    }
  });
  build_tahun();
  load_data();
  load_data_tagihan();
  statistik_total();
  $("#nominal_tagihan").keyup(function(){
    $("#nominal_tagihan").val(FormatAngka($("#nominal_tagihan").val()));
  });
  $("#form_tagihan_khusus").validate({
    submitHandler : function(){
      $("#form_tagihan_khusus").loading();
      var member_id = $("#member_id").val();
      var nama_tagihan = $("#nama_tagihan").val();
      var bulan_tagihan = $("#bulan_tagihan").val();
      var tahun_tagihan = $("#tahun_tagihan").val();
      var nominal_tagihan = StrToNumber($("#nominal_tagihan").val());
      $.ajax({
        type:'post',
        url:'/ajax/tagihan_khusus_tambah.html',
        data:{member_id:member_id,nama:nama_tagihan,bulan:bulan_tagihan,tahun:tahun_tagihan,nominal_pembayaran:nominal_tagihan},
        success:function(resp){
          $("#form_tagihan_khusus").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            toastr["success"](res.msg);
            $('#modal_tagihan_khusus').modal("hide");
            load_data_tagihan();
          }
        },error:function(resp){
          $("#form_tagihan_khusus").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  $("#form_bayar").validate({
    submitHandler : function(){
      $("#modal_bayar_hidden_password").val(CryptoJS.MD5($("#modal_bayar_password").val()));
      var bulan = $("#bulan").val();
      var id = $("#id").val();
      var is_bayar = $("#is_bayar").val();
      var tahun = $("#tahun").val();
      var metode_bayar = "";
      if($("input[name='cr_metode_bayar']:checked").attr("id") == "cr_transfer"){
        metode_bayar = "1";
      }else{
        metode_bayar = "2";
      }
      var bank_id = $("#bank").val();
      var password = $("#modal_bayar_hidden_password").val();
      if(tahun == ""){
        toastr["error"]("Silahkan isikan tahun pada filter data terlebih dahulu");
      }else{
        $("#form_bayar").loading();
        $.ajax({
          type:'post',
          url:'/ajax/pembayaran_bayar_khusus.html',
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
              load_data_tagihan();
            }
          },error:function(){
            $("#form_bayar").loading("stop");
            toastr["error"]("Silahkan periksa koneksi internet anda");
          }
        });
      }

    }
  });
  $("#form_password_total_tagihan").validate({
    submitHandler:function(){
      $("#hidden_password_total_tagihan").val(CryptoJS.MD5($("#password_total_tagihan").val()));
      var password = $("#hidden_password_total_tagihan").val();
      $("#form_password_total_tagihan").loading();
      $.ajax({
        type:'post',
        url:'/ajax/pembayaran_get_omset_mitra_persentase.html',
        data:{password:password},
        success:function(resp){
          $("#form_password_total_tagihan").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            var omset_mitra_persentase = res.output;
            $("#modal_password_total_tagihan").modal("hide");
            var total_tagihan_bersih = total_tagihan - total_tagihan_ppn;
            var total_tagihan_bersih_mitra = Math.round(total_tagihan_bersih * (parseInt(omset_mitra_persentase) / 100));
            var total_tagihan_bersih_isp = total_tagihan_bersih - total_tagihan_bersih_mitra;
            $("#total_tagihan_bersih").html(FormatAngka(total_tagihan_bersih));
            $("#total_tagihan_bersih_isp").html(FormatAngka(total_tagihan_bersih_isp));
            $("#total_tagihan_bersih_mitra").html(FormatAngka(total_tagihan_bersih_mitra));
            $(".widget-password").show();
          }
        },error:function(){
          $("#form_password_total_tagihan").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
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
  $("#form_hapus").validate({
    submitHandler : function(){
      $("#modal_hapus_hidden_password").val(CryptoJS.MD5($("#modal_hapus_password").val()));
      $.confirm({
        title: 'Konfirmasi',
        content: 'Apa anda yakin menghapus tagihan tersebut ?',
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
                var id = $("#id_hapus").val();
                var password = $("#modal_hapus_hidden_password").val();
                $("#form_hapus").loading();
                $.ajax({
                  type:'post',
                  url:'/ajax/pembayaran_khusus_hapus.html',
                  data:{id:id,password:password},
                  success:function(resp){
                    $("#form_hapus").loading("stop");
                    var res = JSON.parse(resp);
                    var html = "";
                    if(res.is_error){
                      if(res.must_login){
                        window.location = "/login.html";
                      }else{
                        toastr["error"](res.msg);
                      }
                    }else{
                      $("#modal_hapus").modal("hide");
                      toastr["success"]("Berhasil menghapus");
                      load_data_tagihan();
                    }
                  },error:function(){
                    $("#form_hapus").loading("stop");
                    toastr["error"]("Silahkan periksa koneksi internet anda");
                  }
                });
              }
            }
        }
      });
    }
  });
});
function widget_total(){
  var bulan = $("#bulan").val();
  $(".bulan").html("(" + IndexToMonth(parseInt(bulan) - 1) + " " + $("#tahun").val() + ")");
  $.each(new_data_statistik_total,function(k,v){
    if(bulan == (k + 1)){
      total_tagihan = v['total_tagihan'];
      total_belum_dibayar = v['total_belum_dibayar'];
      total_dibayar = v['total_dibayar'];
      $("#total_belum_dibayar").html("Rp. " + FormatAngka(v['total_belum_dibayar']));
      $("#total").html("Rp. " + FormatAngka(v['total_tagihan']));
      $("#total_dibayar").html("Rp. " + FormatAngka(v['total_dibayar']));
      var harga_belum_ppn = Math.round(100 / 110 * parseInt(total_tagihan));
      total_tagihan_ppn = total_tagihan - harga_belum_ppn;
      $("#total_tagihan_ppn").html("Rp. " + FormatAngka(total_tagihan_ppn));
    }
  });
}
function tampilkan_widget_lainnya(){
  $("#form_password_total_tagihan").trigger("reset");
  $("#modal_password_total_tagihan").modal("show");
}
function build_tahun(){
  var html = "";
  var tahun_sekarang = parseInt(moment().format("YYYY"));
  $("#tahun").val(tahun_sekarang);
  $(".tahun").html("(" + tahun_sekarang + ")");
  $("#tahun").datepicker({
    format: "yyyy",
    viewMode: "years",
    minViewMode: "years",
    autoclose: true
  }).on("changeYear", function(e) {
    $(".tahun").html("(" + $("#tahun").val() + ")");
    setTimeout(function(){
      page = 1;
      load_data();
      page2 = 1;
      load_data_tagihan();
      statistik_total();
    },100);
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
        var no = (page * 5) - 4;
        var first = no;
        $.each(data,function(k,v){
          if(k < 5){
            var bulan = v['bulan'];
            var arr_bulan = bulan.split(",");
            var awal_tagihan_tahun = parseInt(v['awal_tagihan_tahun']);
            var awal_tagihan_bulan = parseInt(v['awal_tagihan_bulan']);
            html += "<tr>";
            html += "<td>" +  no + "</td>";
            html += "<td>" +  v['nama_server'] + "</td>";
            html += "<td><a href='javascript:void(0);' class='text-link font-weight-bold' onclick='modal_detail(this)' data-name='" + v['name'] +  "' data-password='" + v['password'] +  "' data-profile='" + v['profile'] +  "' data-nama='" + v['nama'] + "' data-alamat='" + v['alamat'] + "' data-no-wa='" + v['no_wa'] + "' data-email='" + v['email'] + "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "' data-awal-tagihan-bulan='" + v['awal_tagihan_bulan'] + "' data-awal-tagihan-tahun='" + v['awal_tagihan_tahun'] + "'>" + v['nama'] + "</a></td>";

            var bulan_berhenti_langganan = v['bulan_berhenti_langganan'];
            var tahun_berhenti_langganan = v['tahun_berhenti_langganan'];
            for(var a=0;a<12;a++){
              var belum_waktunya = false;
              if(tahun < cur_thn){
                belum_waktunya = false;
              }else if(cur_thn == tahun){
                if((a + 1) <=cur_bln){
                  belum_waktunya = false;
                }else{
                  belum_waktunya = true;
                }
              }else{
                belum_waktunya = true;
              }
              var berhenti_langganan = false;
              if(v['is_berhenti_langganan']){
                if(tahun > tahun_berhenti_langganan){
                  berhenti_langganan = true;
                }else if(tahun_berhenti_langganan == tahun){
                  if((a + 1) > bulan_berhenti_langganan){
                    berhenti_langganan = true;
                  }else{
                    berhenti_langganan = false;
                  }
                }else{
                  berhenti_langganan = false;
                }
              }
              var is_bayar = "<span class='fa fa-times-circle text-danger'></span>";
              if(arr_bulan.indexOf((a + 1).toString()) != -1){
                is_bayar = "<span class='fa fa-check text-success'></span>";
              }
              if(belum_waktunya == true || berhenti_langganan == true){
                is_bayar = "";
              }else{
                if(tahun <= awal_tagihan_tahun){
                  if(tahun == awal_tagihan_tahun){
                    if((a + 1) < awal_tagihan_bulan){
                      is_bayar = "";
                    }
                  }else{
                    is_bayar = "";
                  }
                }
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
function statistik_total(){
  data_statistik_total = [];
  var tahun = $("#tahun").val();
  total_tagihan_data(1,tahun);
}
function total_tagihan_data(bulan,tahun){
  if(bulan > cur_bln){
    data_statistik_total.push({
      total_tagihan:0,
      total_dibayar:0,
      total_belum_dibayar:0
    });
    if(bulan == 12){
      total_tagihan_khusus_data(tahun);
    }else{
      total_tagihan_data(bulan + 1,tahun);
    }
  }else{
    $.ajax({
      type:'post',
      url:'/ajax/total_tagihan.html',
      data:{bulan:bulan,tahun:tahun},
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
          data_statistik_total.push({
            total_tagihan:total_tagihan,
            total_dibayar:total_dibayar,
            total_belum_dibayar:total_belum_dibayar
          });
        }
        if(bulan == 12){
          total_tagihan_khusus_data(tahun);
        }else{
          total_tagihan_data(bulan + 1,tahun);
        }
      },error:function(){

      }
    });
  }
}
function total_tagihan_khusus_data(tahun){
  $.ajax({
    type:'post',
    url:'/ajax/total_tagihan_khusus_stat.html',
    data:{tahun:tahun},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          var data_statistik_khusus_total = [];
          for(var i=0;i<12;i++){
            data_statistik_khusus_total.push({
              total_tagihan:0,
              total_dibayar:0,
              total_belum_dibayar:0,
            });
          }
          statistik_combine_data(data_statistik_khusus_total);
        }
      }else{
        var data_total = [];
        var data_total_dibayar = [];
        var data_total_belum_dibayar = [];
        for(var i=1;i<=12;i++){
          var data = 0;
          $.each(res['data_total'],function(k,v){
            if(v['bulan'] == i){
                data = v['total'];
                return false;
            }
          });
          data_total.push(data);
        }
        for(var i=1;i<=12;i++){
          var data = 0;
          $.each(res['data_total_dibayar'],function(k,v){
            if(v['bulan'] == i){
                data = v['total'];
                return false;
            }
          });
          data_total_dibayar.push(data);
        }
        for(var i=0;i<12;i++){
          var get_total = data_total[i] - data_total_dibayar[i];
          data_total_belum_dibayar.push(get_total);
        }
        var data_statistik_khusus_total = [];
        for(var i=0;i<12;i++){
          data_statistik_khusus_total.push({
            total_tagihan:data_total[i],
            total_dibayar:data_total_dibayar[i],
            total_belum_dibayar:data_total_belum_dibayar[i]
          });
        }
        statistik_combine_data(data_statistik_khusus_total);
      }
    },error:function(){

    }
  });
}
function statistik_combine_data(data_statistik_khusus_total){
  new_data_statistik_total = [];
  for(var i=0;i<12;i++){
    var total_tagihan = parseInt(data_statistik_total[i]['total_tagihan']) + parseInt(data_statistik_khusus_total[i]['total_tagihan']);
    var total_dibayar = parseInt(data_statistik_total[i]['total_dibayar']) + parseInt(data_statistik_khusus_total[i]['total_dibayar']);
    var total_belum_dibayar = parseInt(data_statistik_total[i]['total_belum_dibayar']) + parseInt(data_statistik_khusus_total[i]['total_belum_dibayar']);
    new_data_statistik_total.push({
      total_tagihan:total_tagihan,
      total_dibayar:total_dibayar,
      total_belum_dibayar:total_belum_dibayar
    });
  }
  widget_total();
  statistik_chart();
}
function statistik_chart() {
  var tahun = $("#tahun").val();
  var bulan = $("#bulan").val();
  if(statistik_chart_render != null){
    statistik_chart_render.destroy();
  }
  var labels = [];
  var datas_total = [];
  var datas_dibayar = [];
  var datas_belum_dibayar = [];

  $.each(new_data_statistik_total,function(k,v){
    datas_total.push(v['total_tagihan']);
    datas_dibayar.push(v['total_dibayar']);
    datas_belum_dibayar.push(v['total_belum_dibayar']);
  });
  for(var i=0;i<12;i++){
    labels.push(IndexToMonth_Short(i));
  }
  var ctx = document.getElementById('statistik_chart');
  if($(window).width() > 500){
    ctx.height = 100;
  }
  statistik_chart_render = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
            label: 'Total Tagihan',
            data: datas_total,
            backgroundColor: 'rgba(10,100,255,0.5)',
            borderColor: 'rgba(10,100,255,1)'
        },{
            label: 'Tagihan Belum Dibayar',
            data: datas_belum_dibayar,
            backgroundColor: 'rgba(255,50,50,0.5)',
            borderColor: 'rgba(255,50,50,1)'
        },{
            label: 'Tagihan Sudah Dibayar',
            data: datas_dibayar,
            backgroundColor: 'rgba(50,255,100,0.5)',
            borderColor: 'rgba(50,255,100,1)'
        }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }],
              xAxes: [{
                ticks: {
                    maxTicksLimit:12,
                    maxRotation: 0,
                    minRotation: 0
                }
              }]
          },
          tooltips: {
            mode:'point',
            callbacks: {
                title: function(tooltipItems, data) {
                     return data.datasets[tooltipItems[0].datasetIndex].data[tooltipItems[0].index].x;
                },
                label: function (tooltipItem, data) {
                  console.log(tooltipItem);
                    var jenis_total = tooltipItem['datasetIndex'];
                    if(jenis_total == "0"){
                      jenis_total = "Total Tagihan - ";
                    }else if(jenis_total == "1"){
                      jenis_total = "Tagihan Belum Dibayar - ";
                    }else if(jenis_total == "2"){
                      jenis_total = "Tagihan Sudah Dibayar - ";
                    }
                    var bln = tooltipItem['index'];
                    var label = jenis_total + " " + IndexToMonth(bln) + " " + tahun;
                    return label;
                },
                afterLabel: function(tooltipItem, data) {
                   return "Rp. " + FormatAngka(tooltipItem['value']);
                }
            }
          }
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
  if(no_wa == ""){
    no_wa = "-";
  }
  var email = $(itu).attr("data-email");
  if(email == ""){
    email = "-";
  }
  var nominal_pembayaran = $(itu).attr("data-nominal-pembayaran");
  var awal_tagihan_bulan = $(itu).attr("data-awal-tagihan-bulan");
  var awal_tagihan_tahun = $(itu).attr("data-awal-tagihan-tahun");
  $("#name").html(name);
  $("#password").html(password);
  $("#profile").html(profile);
  $("#nama").html(nama);
  $("#alamat").html(alamat);
  $("#no_wa").html(no_wa);
  $("#email").html(email);
  $("#nominal_pembayaran").html("Rp. " + FormatAngka(nominal_pembayaran));
  $("#tagihan_dimulai").html(IndexToMonth(parseInt(awal_tagihan_bulan) - 1) + " " + awal_tagihan_tahun);
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
function modal_tagihan_khusus(){
  $("#modal_tagihan_khusus").modal("show");
  dropdown_member();
}
function dropdown_member(){
  $("#member_id").loading();
  $.ajax({
    type:'post',
    url:'/ajax/dropdown_member.html',
    data:{},
    success:function(resp){
      $("#member_id").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        var html = "<option value=''>Pilih Member</option>";
        $.each(res.data,function(k,v){
          html += "<option value='" + v['id'] + "'>" + v['nama'] + "</option>";
        });
        $("#member_id").html(html);
        $("#member_id").select2({
          theme: "bootstrap"
        });
      }
    },error:function(){
      $("#member_id").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function load_data_tagihan(){
  $("#pagination2").html("");
  $("#listdata2").loading();
  var keyword = $("#keyword_tagihan").val();
  var tahun = $("#tahun").val();
  $.ajax({
    type:'post',
    url:'/ajax/tagihan_khusus.html',
    data:{keyword:keyword,tahun:tahun,page:page2},
    success:function(resp){
      $("#listdata2").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata2").html("<tr><td colspan='8'>" + res.msg + "</td></tr>");
          $("#info_page2").html("0 - 0 dari 0");
        }
      }else{
        var data = res.data;
        var html = "";
        var no = (page * 5) - 4;
        var first = no;
        $.each(data,function(k,v){
          if(k < 5){
            var k2=0;
            var id_arr = v['id'].split("|-|");
            var nama_arr = v['nama'].split("|-|");
            var bulan_arr = v['bulan'].split("|-|");
            var tahun_arr = v['tahun'].split("|-|");
            var is_bayar_arr = v['is_bayar'].split("|-|");
            var metode_bayar_arr = v['metode_bayar'].split("|-|");
            var nama_bank_arr = v['nama_bank'].split("|-|");
            var bank_id_arr = v['bank_id'].split("|-|");
            var nominal_pembayaran_arr = v['nominal_pembayaran'].split("|-|");
            var panjang_row = nama_arr.length;
            var status_bayar = "";
            html += "<tr>";
            html += "<td rowspan='" + panjang_row + "'>" + no + "</td>";
            html += "<td rowspan='" + panjang_row + "'>" + v['nama_router'] + "</td>";
            html += "<td rowspan='" + panjang_row + "'><a href='/member/detail/" + v['ppp_secret_id'] + "/" + v['server_id'] + ".html' target='_blank'><b>" + v['nama_member'] + "</b></a></td>";
            html += "<td>" + nama_arr[k2] + "</td>";
            html += "<td>" + IndexToMonth(parseInt(bulan_arr[k2]) - 1) + "</td>";
            html += "<td>Rp. " + FormatAngka(nominal_pembayaran_arr[k2]) + "</td>";
            if(is_bayar_arr[k2] == "1"){
              status_bayar = "<span class='badge badge-success'>Sudah dibayar</span>";
            }else{
              status_bayar = "<span class='badge badge-danger'>Belum dibayar</span>";
            }
            html += "<td>" + status_bayar + "</td>";
            html += "<td>";
            if(is_bayar_arr[k2] == "1"){
              if(metode_bayar_arr[k2] == "1" || metode_bayar_arr[k2] == "2"){
                html += "<a onclick='modal_bayar(this)' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-danger'>Batalkan Pembayaran</a> ";
              }else{
                html += "<a onclick='modal_bayar(this)' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-primary'>Lihat Pembayaran</a> ";
              }
            }else{
              html += "<a onclick='modal_bayar(this)' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-primary'>Bayar</a> ";
            }
            if(is_bayar_arr[k2] != "1"){
              html += "<a onclick='modal_hapus(this);' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-danger'>Hapus</a>";
            }
            html += "</td>";
            html += "</tr>";
            no++;
            k2 = nama_arr.length - 1;
            for(var i=1;i<nama_arr.length;i++){
              html += "<tr>";
              html += "<td>" + nama_arr[k2] + "</td>";
              html += "<td>" + IndexToMonth(parseInt(bulan_arr[k2]) - 1) + "</td>";
              html += "<td>Rp. " + FormatAngka(nominal_pembayaran_arr[k2]) + "</td>";
              if(is_bayar_arr[k2] == "1"){
                status_bayar = "<span class='badge badge-success'>Sudah dibayar</span>";
              }else{
                status_bayar = "<span class='badge badge-danger'>Belum dibayar</span>";
              }
              html += "<td>" + status_bayar + "</td>";
              html += "<td>";
              if(is_bayar_arr[k2] == "1"){
                if(metode_bayar_arr[k2] == "1" || metode_bayar_arr[k2] == "2"){
                  html += "<a onclick='modal_bayar(this)' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-danger'>Batalkan Pembayaran</a> ";
                }else{
                  html += "<a onclick='modal_bayar(this)' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-primary'>Lihat Pembayaran</a> ";
                }
              }else{
                html += "<a onclick='modal_bayar(this)' data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-primary'>Bayar</a> ";
              }
              if(is_bayar_arr[k2] != "1"){
                html += "<a onclick='modal_hapus(this);'  data-id='" + id_arr[k2] + "' data-nama-client='" + v['nama_member'] + "' data-bulan='" + bulan_arr[k2] + "' data-tahun='" + tahun_arr[k2] + "' data-nominal-bayar='" + nominal_pembayaran_arr[k2] + "' data-nama-tagihan='" + nama_arr[k2] + "' data-is-bayar='" + is_bayar_arr[k2] + "' data-metode-bayar='" + metode_bayar_arr[k2] + "' data-bank-id='" + bank_id_arr[k2] + "' data-nama-bank='" + nama_bank_arr[k2] + "' href='javascript:void(0);' class='btn btn-sm btn-danger'>Hapus</a>";
              }
              html += "</td>";
              html += "</tr>";
              k2--;
            }
          }
        });
        $("#listdata2").html(html);
        html_pagination2(res.data.length);
        $("#info_page2").html(first + " - " + (no - 1) + " dari " + FormatAngka(res.total));
      }
    },error:function(){
      $("#listdata2").loading("stop");
      $("#info_page2").html("0 - 0 dari 0");
      $("#listdata2").html("<tr><td colspan='8'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function html_pagination2(jmldata){
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
    html_pagination += "      <a class='page-link text-body prevpage2' data-page='" + (parseInt(page) - 1) + "' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-body'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }
  html_pagination += "    <li class='page-item disabled'><a class='page-link text-body' href='javascript:void(0);'>" + page + "</a></li>";
  if(jmldata > 5){
    //Isnext true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body nextpage2' data-page='" + (parseInt(page) + 1) + "' href='javascript:void(0);'>";
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
  $("#pagination2").html(html_pagination);
  trigger_pagination2();
}
function trigger_pagination2(){
  $(".prevpage2").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data(true);
  });
  $(".nextpage2").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data(true);
  });
}
function modal_bayar(itu){
  var nama_client = $(itu).attr("data-nama-client");
  var nama_tagihan = $(itu).attr("data-nama-tagihan");
  var profile = $(itu).attr("data-profile");
  var nominal = $(itu).attr("data-nominal-bayar");
  var bulan = $(itu).attr("data-bulan");
  var tahun = $(itu).attr("data-tahun");
  var is_bayar = $(itu).attr("data-is-bayar");
  var metode_bayar = $(itu).attr("data-metode-bayar");
  var id = $(itu).attr("data-id");
  $("#modal_bayar_nama_client").html(nama_client);
  $("#modal_bayar_nama_tagihan").html(nama_tagihan);
  $("#modal_bayar_bulan_tahun").html(IndexToMonth(parseInt(bulan) - 1) + " " + tahun);
  $("#bulan").val(bulan);
  $("#id").val(id);
  $("#password").val("");
  $("#is_bayar").val(is_bayar);
  var is_bayar = $("#is_bayar").val();
  if(is_bayar == "1"){
    $("#modal_bayar_nominal_bayar").html("Rp. " + FormatAngka(nominal));
    if(metode_bayar == "3"){
      $("#modal_bayar_tutup").show();
      $("#modal_bayar_aksi").hide();
      $("#metode_bayar_admin").hide();
      $("#metode_bayar_user").show();
      $("#metode_bayar_user").html("<img src='/assets/img/ovo.png' style='width:36px;' />");
      $("#div_bank").hide();
      $("#div_password").hide();
    }else if(metode_bayar == "4"){
      $("#modal_bayar_tutup").show();
      $("#modal_bayar_aksi").hide();
      $("#metode_bayar_admin").hide();
      $("#metode_bayar_user").show();
      $("#metode_bayar_user").html("<img src='/assets/img/qris.png' style='width:200px;vertical-align: bottom;margin-top: 2px;'>");
      $("#div_bank").hide();
      $("#div_password").hide();
    }else{
      $("#modal_bayar_tutup").hide();
      $("#modal_bayar_aksi").show();
      $("#metode_bayar_user").hide();
      $("#metode_bayar_admin").show();
      $("#div_password").show();
      if(metode_bayar == "1"){
        $("#cr_transfer").prop("checked",true);
        $("#div_bank").show();
      }else{
        $("#cr_cash").prop("checked",true);
        $("#div_bank").hide();
      }
      $("#cr_transfer").attr("disabled","disabled");
      $("#cr_cash").attr("disabled","disabled");
      $("#bank").attr("disabled","disabled");
      $("#btn_submit").removeClass("btn-primary");
      $("#btn_submit").addClass("btn-danger");
      $("#btn_submit").html("Batalkan Pembayaran");
    }
  }else{
    $("#modal_bayar_tutup").hide();
    $("#modal_bayar_aksi").show();
    $("#metode_bayar_user").hide();
    $("#metode_bayar_admin").show();
    $("#div_bank").show();
    $("#div_password").show();
    $("#modal_bayar_nominal_bayar").html("Rp. " + FormatAngka(nominal));
    $("#cr_transfer").removeAttr("disabled","disabled");
    $("#cr_cash").removeAttr("disabled","disabled");
    $("#bank").removeAttr("disabled");
    $("#cr_transfer").prop("checked",true);
    $("#btn_submit").removeClass("btn-danger");
    $("#btn_submit").addClass("btn-primary");
    $("#btn_submit").html("Simpan");
  }
  $("#modal_bayar").modal("show");
}
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
          $("#bank").html("<option value=''>Silahkan tambahkan data bank</option>");
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
function modal_hapus(itu){
  var nama_client = $(itu).attr("data-nama-client");
  var nama_tagihan = $(itu).attr("data-nama-tagihan");
  var nominal = $(itu).attr("data-nominal-bayar");
  var bulan = $(itu).attr("data-bulan");
  var tahun = $(itu).attr("data-tahun");
  var id = $(itu).attr("data-id");
  $("#modal_hapus_nama_client").html(nama_client);
  $("#modal_hapus_nama_tagihan").html(nama_tagihan);
  $("#modal_hapus_bulan_tahun").html(IndexToMonth(parseInt(bulan) - 1) + " " + tahun);
  $("#bulan_hapus").val(bulan);
  $("#id_hapus").val(id);
  $("#modal_hapus_password").val("");
  $("#modal_hapus_nominal_bayar").html("Rp. " + FormatAngka(nominal));
  $("#modal_hapus").modal("show");
}
