var chart_timeout = null;
var chart_graph = null;
var inventaris_alat_is_tambah = false;
var page_inventaris_alat = 1;
$(document).ready(function(){
  $("#tgl").val("");
  load_data();
   $("#tgl_pasang").datepicker({
     format:"dd/mm/yyyy"
   });
   $("#form_inventaris_alat").validate({
     submitHandler:function(){
       if(inventaris_alat_is_tambah){
         tambah_inventaris_alat();
       }else{
         edit_inventaris_alat();
       }
     }
   });
   $('#tab_inventaris_alat').on('shown.bs.tab', function (event) {
      load_data_inventaris_alat();
   });
});
function load_data_inventaris_alat(){
  $("#listdata").loading();
  var id = $("#id").val();
  $.ajax({
    type:'post',
    url:'/ajax/member_inventaris_alat_data.html',
    data:{ppp_secret_id:id,page:page_inventaris_alat},
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
        var html = "";
        var no = (page_inventaris_alat * 10) - 9;
        var first = no;
        $.each(res.data,function(k,v){
          if(k < 10){
            var tgl_pasang = v['tgl_pasang'];
            var moment_tgl_pasang = moment(tgl_pasang,"YYYY-MM-DD");
            html += "<tr>";
            html += "<td>" + no + "</td>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['serial_number'] + "</td>";
            html += "<td>" + v['merek'] + "</td>";
            html += "<td>" + moment_tgl_pasang.format("DD") + " " + IndexToMonth(moment_tgl_pasang.month()) + " " + moment_tgl_pasang.format("YYYY") + "</td>";
            html += "<td><a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-serial-number='" + v['serial_number'] + "' data-merek='" + v['merek'] + "' data-tgl-pasang='" + v['tgl_pasang'] + "' onclick='modal_inventaris_alat(0,this)' class='btn btn-light'><span class='fa fa-edit'></span></a> <a onclick='hapus_inventaris_alat(this)' data-id='" + v['id'] + "' href='javascript:void(0);' class='btn btn-danger'><span class='fa fa-trash'></span></a></td>";
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
      $("#listdata").html("<tr><td colspan='6'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function tambah_inventaris_alat(){
  $("#form_inventaris_alat").loading();
  var ppp_secret_id = $("#id").val();
  var nama_alat = $("#nama_alat").val();
  var serial_number = $("#serial_number").val();
  var merek = $("#merek").val();
  var get_tgl_pasang = $("#tgl_pasang").val();
  var moment_tgl_pasang = moment(get_tgl_pasang,"DD/MM/YYYY");
  var tgl_pasang = moment_tgl_pasang.format("YYYY-MM-DD");
  $.ajax({
    type:'post',
    url:'/ajax/member_inventaris_alat_tambah.html',
    data:{ppp_secret_id:ppp_secret_id,nama:nama_alat,serial_number:serial_number,merek:merek,tgl_pasang:tgl_pasang},
    success:function(resp){
      $("#form_inventaris_alat").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        $("#modal_inventaris_alat").modal("hide");
        toastr["success"]("Berhasil menambah data");
        load_data_inventaris_alat();
      }
    },error:function(){
      $("#form_inventaris_alat").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function edit_inventaris_alat(){
  $("#form_inventaris_alat").loading();
  var ppp_secret_id = $("#id").val();
  var inventaris_alat_id = $("#inventaris_alat_id").val();
  var nama = $("#nama_alat").val();
  var serial_number = $("#serial_number").val();
  var merek = $("#merek").val();
  var get_tgl_pasang = $("#tgl_pasang").val();
  var moment_tgl_pasang = moment(get_tgl_pasang,"DD/MM/YYYY");
  var tgl_pasang = moment_tgl_pasang.format("YYYY-MM-DD");
  $.ajax({
    type:'post',
    url:'/ajax/member_inventaris_alat_edit.html',
    data:{id:inventaris_alat_id,ppp_secret_id:ppp_secret_id,nama:nama,serial_number:serial_number,merek:merek,tgl_pasang:tgl_pasang},
    success:function(resp){
      $("#form_inventaris_alat").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        $("#modal_inventaris_alat").modal("hide");
        toastr["success"]("Berhasil mengubah data");
        load_data_inventaris_alat();
      }
    },error:function(){
      $("#form_inventaris_alat").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function hapus_inventaris_alat(itu){
  var ppp_secret_id = $("#id").val();
  var id = $(itu).attr("data-id");
  $.confirm({
    title: 'Konfirmasi',
    content: 'Apa anda yakin menghapus data tersebut ?',
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
              url:'/ajax/member_inventaris_alat_hapus.html',
              data:{id:id,ppp_secret_id:ppp_secret_id},
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
                  toastr["success"]("Berhasil menghapus");
                  load_data_inventaris_alat();
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
function cetak(itu){
  var id = $(itu).attr("data-id");
  $(itu).find("span").removeClass("fa-file-pdf-o");
  $(itu).find("span").addClass("fa-spin");
  $(itu).find("span").addClass("fa-spinner");
  $(itu).addClass("disabled");
  $.ajax({
    type:'post',
    url:'/ajax/member_cetak_invoice.html',
    data:{id:id},
    success:function(resp){
      $(itu).find("span").addClass("fa-file-pdf-o");
      $(itu).find("span").removeClass("fa-spin");
      $(itu).find("span").removeClass("fa-spinner");
      $(itu).removeClass("disabled");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        var output = res.output;
        window.open(output,"_blank");
      }
    },error:function(){
      $(itu).find("span").addClass("fa-file-pdf-o");
      $(itu).find("span").removeClass("fa-spin");
      $(itu).find("span").removeClass("fa-spinner");
      $(itu).removeClass("disabled");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function load_data(){
  $("#data").loading();
  var id = $("#id").val();
  $.ajax({
    type:'post',
    url:'/ajax/member_get.html',
    data:{id:id},
    success:function(resp){
      $("#data").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#data").html("<div class='alert alert-warning'>" + res.msg + "</div>");
        }
      }else{
        var data = res.data[0];
        var name = data['name'];
        $("#member_id").val(data['member_id']);
        $("#name").html(data['name']);
        $("#password").html(data['password']);
        $("#profile").html(data['profile']);
        $("#nama").html(data['nama']);
        $("#alamat").html(data['alamat']);
        $("#no_wa").html(data['no_wa']);
        $("#email").html(data['email']);
        if(data['awal_tagihan_bulan'] != null){
          $("#awal_tagihan").html(IndexToMonth(parseInt(data['awal_tagihan_bulan']) - 1) + " " + data['awal_tagihan_tahun']);
        }
        $("#nominal_pembayaran").html("Rp. " + FormatAngka(data['nominal_pembayaran']));
        if(data['is_active'] == "1"){
          $("#widget_is_active").addClass("widget-success");
          $("#widget_is_active").removeClass("widget-danger");
          $("#is_active").html("ONLINE");
          $("#widget_is_active").show();
        }else{
          $("#widget_is_active").addClass("widget-danger");
          $("#widget_is_active").removeClass("widget-success");
          $("#is_active").html("OFFLINE");
          $("#widget_is_active").show();
        }
        $(".daterange").daterangepicker({
          autoUpdateInput: false,
          opens: 'left',
          timePicker: true,
          timePicker24Hour: true,
        }, function (start, end, label) {

        });
        $(".clear").click(function(){
          $(this).parent().parent().find("input").val("");
          chart_graph.destroy();
          chart_graph = null;
          chart_data(name);
        });
        $('.daterange').on('apply.daterangepicker', function(ev, picker) {
          $(this).val(picker.startDate.format('DD/MM/YYYY HH:mm') + ':00 - ' + picker.endDate.format('DD/MM/YYYY HH:mm') + ":00");
          chart_database(picker.startDate.format('YYYY-MM-DD'),picker.endDate.format('YYYY-MM-DD'),picker.startDate.format('YYYY-MM-DD HH:mm') + ":00",picker.endDate.format('YYYY-MM-DD HH:mm') + ":00",name);
        });
        chart_data(name);
      }
    },error:function(){
      $("#data").loading("stop");
      $("#data").html("<div class='alert alert-warning'>Silahkan periksa koneksi internet anda</div>");
    }
  });
}
function chart_database(tgl_start,tgl_end,tgl_start_complete,tgl_end_complete){
  var member_id = $("#member_id").val();
  var server_id = $("#server_id_unselected").val();
  $.ajax({
    type:'post',
    url:'/ajax/member_traffic_data.html',
    data:{tgl_start:tgl_start,tgl_end:tgl_end,member_id:member_id,server_id:server_id},
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
        chart_graph.destroy();
        chart_graph = null;
        if(chart_timeout != undefined){
          clearTimeout(chart_timeout);
        }
        chart2(data,tgl_start_complete,tgl_end_complete);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function chart_data(name){
  var server_id = $("#server_id_unselected").val();
  $.ajax({
    type:'post',
    url:'/ajax/ppp_interface_monitor.html',
    data:{name:name,server_id:server_id},
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
        chart(data);
        chart_timeout = setTimeout(function(){
          chart_data(name);
        },5000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function chart(data){
  var m = moment();
  var sekarang = m.format("HH:mm:ss");
  var tx_value = data[0]['txBitsPerSecond'];
  var rx_value = data[0]['rxBitsPerSecond'];


  var ctx = document.getElementById('chart').getContext('2d');
  if(chart_graph != null){
    if(chart_graph.data.datasets[0].data.length >= 10){
      chart_graph.data.labels.shift();
      chart_graph.data.datasets[0].data.shift();
      chart_graph.data.datasets[1].data.shift();
    }

    chart_graph.data.labels.push(sekarang);
    chart_graph.data.datasets[0].data.push(tx_value);
    chart_graph.data.datasets[1].data.push(rx_value);
    chart_graph.update();
  }else{
    chart_graph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [sekarang],
            datasets: [{
                label: 'Tx',
                data: [tx_value],
                backgroundColor: 'rgba(100,255,150,0.5)',
  					    borderColor: 'rgba(100,255,150,1)'
            },{
                label: 'Rx',
                data: [rx_value],
                backgroundColor: 'rgba(255,110,100,0.5)',
  					    borderColor: 'rgba(255,110,100,1)'
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                      beginAtZero: true,
                      maxTicksLimit:5,
                      callback: function(label, index, labels) {
                          var label_formatted = BitToDigitalStorageUnit(label);
                          return label_formatted['value'].toFixed(2) + " " + label_formatted['label'].toLowerCase() + "ps";
                      }
                    }
                }]
            },
            tooltips: {
              mode:'x-axis',
              callbacks: {
                  label: function (tooltipItem, data) {
                      var label_formatted = BitToDigitalStorageUnit(data.datasets[tooltipItem['datasetIndex']].data[tooltipItem.index]);
                      return data.datasets[tooltipItem['datasetIndex']]['label'] + " : " + label_formatted['value'].toFixed(2) + " " + label_formatted['label'].toLowerCase() + "ps";
                  }
              }
            }
        }
    });
  }
}
function chart2(data,tgl_start_complete,tgl_end_complete){
  var datas = [];
  $.each(data,function(k,v){
    var json_hasil = [];
    var hasil = v['hasil'];
    if(hasil != ""){
      json_hasil = JSON.parse(hasil);
    }
    datas = datas.concat(json_hasil);
  });
  var labels = [];
  var tx_values = [];
  var rx_values = [];
  $.each(datas,function(k,v){
    var timestamp = v['s'];
    var time_timestamp = timestamp;
    var time_tgl_start_complete = moment(tgl_start_complete,"YYYY-MM-DD HH:mm:ss").unix();
    var time_tgl_end_complete = moment(tgl_end_complete,"YYYY-MM-DD HH:mm:ss").unix();
    if(time_timestamp >= time_tgl_start_complete && time_timestamp <= time_tgl_end_complete){
      labels.push(moment.unix(timestamp).format("DD-MM-YYYY (HH:mm)"));
      var tx = "0";
      if(v['tx'] != ""){
        tx = v['tx'];
      }
      var rx = "0";
      if(v['rx'] != ""){
        rx = v['rx'];
      }
      tx_values.push(parseInt(tx));
      rx_values.push(parseInt(rx));
    }
  });
  var ctx = document.getElementById('chart').getContext('2d');
  chart_graph = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Tx',
              data: tx_values,
              backgroundColor: 'rgba(100,255,150,0.5)',
              borderColor: 'rgba(100,255,150,1)'
          },{
              label: 'Rx',
              data: rx_values,
              backgroundColor: 'rgba(255,110,100,0.5)',
              borderColor: 'rgba(255,110,100,1)'
          }]
      },
      options: {
        elements: {
                  point:{
                      radius: 0
                  }
              },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true,
                      maxTicksLimit:3,
                      callback: function(label, index, labels) {
                        var label_formatted = BitToDigitalStorageUnit(label);
                        return label_formatted['value'].toFixed(2) + " " + label_formatted['label'].toLowerCase() + "ps";
                      }
                  }
              }],
              xAxes: [{
                  ticks: {
                      beginAtZero: true,
                      maxTicksLimit:4,
                      maxRotation: 0,
                      minRotation: 0
                  }
              }]
          },
          tooltips: {
            mode:'x-axis',
            callbacks: {
                label: function (tooltipItem, data) {
                  var label_formatted = BitToDigitalStorageUnit(data.datasets[tooltipItem['datasetIndex']].data[tooltipItem.index]);
                  return data.datasets[tooltipItem['datasetIndex']]['label'] + " : " + label_formatted['value'].toFixed(2) + " " + label_formatted['label'].toLowerCase() + "ps";
                }
            }
          }
      }
  });
}
function modal_inventaris_alat(is_tambah,itu){
  $("#form_inventaris_alat").trigger("reset");
  $("#modal_inventaris_alat").modal("show");
  if(is_tambah == "1"){
    inventaris_alat_is_tambah = true;
    $("#modal_inventaris_alat_title").html("Tambah Inventaris Alat");
  }else{
    inventaris_alat_is_tambah = false;
    $("#modal_inventaris_alat_title").html("Edit Inventaris Alat");
    var nama = $(itu).attr("data-nama");
    var serial_number = $(itu).attr("data-serial-number");
    var merek = $(itu).attr("data-merek");
    var get_tgl_pasang = $(itu).attr("data-tgl-pasang");
    var moment_tgl_pasang = moment(get_tgl_pasang,"YYYY-MM-DD");
    var tgl_pasang = moment_tgl_pasang.format("YYYY/MM/DD");
    var id = $(itu).attr("data-id");
    $("#inventaris_alat_id").val(id);
    $("#nama_alat").val(nama);
    $("#serial_number").val(serial_number);
    $("#merek").val(merek);
    $("#tgl_pasang").val(tgl_pasang);
  }
}
function html_pagination(jmldata){
  var html_pagination = "";
  html_pagination += "<div class='d-inline-block'>";
  html_pagination += "  <ul class='pagination'>";

  if(page_inventaris_alat == 1){
    //Isprev false
    html_pagination += "    <li class='page-item disabled'>";
    html_pagination += "      <a class='page-link text-secondary' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-secondary'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }else{
    //Isprev true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body prevpage' data-page='" + (parseInt(page_inventaris_alat) - 1) + "' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-body'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }
  html_pagination += "    <li class='page-item disabled'><a class='page-link text-body' href='javascript:void(0);'>" + page_inventaris_alat + "</a></li>";
  if(jmldata > 10){
    //Isnext true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body nextpage' data-page='" + (parseInt(page_inventaris_alat) + 1) + "' href='javascript:void(0);'>";
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
    page_inventaris_alat = get_page;
    load_data_inventaris_alat(true);
  });
  $(".nextpage").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page_inventaris_alat = get_page;
    load_data_inventaris_alat(true);
  });
}
