var cpu_gauge_chart = null;
var memory_gauge_chart = null;
var hdd_gauge_chart = null;
var interface_chart = null;
var interface_timeout = null;
var data_lokasi = [];
$(document).ready(function(){
  system_resources();
  system_health();
  interface_combobox();
  netwatch();
  master_lokasi();
  $("#form_lokasi").validate({
    messages: {
        lokasi: "Lokasi wajib dipilih"
    },
    errorPlacement: function(error, element) {
      error.insertAfter(element.parent());
    },
    submitHandler:function(){
      $("#form_lokasi").loading();
      var master_kota_id = $("#lokasi").val();
      $.ajax({
        type:'post',
        url:'/ajax/master_kota_id_simpan.html',
        data:{master_kota_id:master_kota_id},
        success:function(resp){
          $("#form_lokasi").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            toastr["success"]("Berhasil menyimpan");
            $("#cur_master_kota_id").val(master_kota_id);
            $("#modal_lokasi").modal("hide");
            build_cuaca();
          }
        },error:function(){
          $("#form_lokasi").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  })
});
function system_resources(){
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
        cpu(data);
        memory(data);
        hdd(data);
        setTimeout(function(){
          system_resources();
        },1000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function master_lokasi(){
  var cur_master_kota_id = $("#cur_master_kota_id").val();
  if(cur_master_kota_id == "" || cur_master_kota_id == "0"){
    $("#modal_lokasi").modal({
      backdrop: 'static',
      keyboard: false
    });
  }
  $.ajax({
    type:'post',
    url:'/ajax/master_lokasi.html',
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
        data_lokasi = data;
        var html = "";
        html += "<option value=''>Pilih Kota / Kabupaten</option>";
        $.each(data,function(k,v){
          html += "<option value='" + v['id'] + "'>" + v['nama_kota_kab'] + " - " + v['nama_provinsi'] + "</option>";
        });
        $("#lokasi").html(html);
        $("#lokasi").select2({
          width:'100%'
        });
        build_cuaca();
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function modal_lokasi() {
  $("#modal_lokasi").modal({

  });
  var cur_master_kota_id = $("#cur_master_kota_id").val();
  $("#lokasi").val(cur_master_kota_id).trigger("change");
  build_cuaca();
}
function build_cuaca(){
  var cur_master_kota_id = $("#cur_master_kota_id").val();
  var bmkg_id = "";
  var nama_lokasi = "";
  var data = {};
  $.each(data_lokasi,function(k,v){
    if(v['id'] == cur_master_kota_id){
      data = v;
      nama_lokasi = TitleCase(v['nama_kota_kab']) + " - " + TitleCase(v['nama_provinsi']);
      bmkg_id = v['bmkg_id'];
    }
  });
  $("#nama_lokasi").html(nama_lokasi);
  if(!$.isEmptyObject(data)){
    $.ajax({
      type:'get',
      url:data['bmkg_url'],
      cache: false,
      dataType: "xml",
      data:{},
      success:function(xml){
        $(xml).find('data').find('forecast').find('area').each(function(){
          var area = $(this);
          if(area.attr('id') == bmkg_id){
            var parameter_id = area.find("parameter");
            var weather = null;
            var temperature = null;
            $(parameter_id).each(function(){;
              if($(this).attr("id") == "weather"){
                  weather = $(this).find("timerange");
              }else if($(this).attr("id") == "t"){
                  temperature = $(this).find("timerange");
              }
            });
            var sekarang = moment();
            var tgl = sekarang.format("YYYYMMDD");
            // $("#tgl").html("<span class='fa fa-calendar'></span> " + sekarang.format("DD") + " " + IndexToMonth(parseInt(sekarang.format("M")) - 1) + " " + sekarang.format("YYYY"));
            var jam = "";
            var jam_sekarang = parseInt(sekarang.format("H"));
            if(jam_sekarang <= 24){
              jam = "1800";
            }else if(jam_sekarang <= 18){
              jam = "1200";
            }else if(jam_sekarang <= 12){
              jam = "0000";
            }
            var daftar_cuaca = "";
            var waktu =tgl + jam;
            var html = "";
            var suhu = "";
            var cuaca = "";
            $(weather).each(function(){
              var temperature_value = "";
              $(temperature).each(function(){
                var value = $(this).find("value")[0];
                var value2 = $(this).find("value")[1];
                if($(value).attr("unit") == "C"){
                  temperature_value = $(value).text();
                  return false;
                }else if($(value2).attr("unit") == "C"){
                  temperature_value = $(value2).text();
                  return false;
                }
              });
              if(waktu == $(this).attr("datetime")){
                suhu = temperature_value + " &deg;C";
                cuaca = $(this).find("value").text();
              }
              var jam_only = $(this).attr("datetime").substr(8,4);
              if(tgl == $(this).attr("datetime").substr(0,8)){
                daftar_cuaca += "<tr>";
                daftar_cuaca += "<td class='pl-0 pb-2'>" + jam_only.substr(0,2) + ":" + jam_only.substr(2,2) + "</td>";
                daftar_cuaca += "<td class='px-0'>:</td>";
                daftar_cuaca += "<td class='pr-0'>" + temperature_value + " &deg;C" + " / " + ParseBMKGCuaca($(this).find("value").text()) + "</td>";
                daftar_cuaca += "</tr>";
              }
            });
            $("#daftar_cuaca").html(daftar_cuaca);
            $("#bmkg_ket").show();
            setTimeout(function(){
              build_cuaca();
            },360000);
          }
        });
      },error:function(){

      }
    });
  }
}
function cpu(data){
  $("#cpu_count").html(data['cpuCount']);
  $("#cpu_frequency").html(data['cpuFrequency'] + " MHz");
  var cpu_load = data['cpuLoad'];
  var cpu_free = 100 - cpu_load;
  if(cpu_gauge_chart != null){
    cpu_gauge_chart.refresh(cpu_load);
  }else{
    cpu_gauge_chart = new JustGage({
              id: "cpu_load",
              value: cpu_load,
              min: 0,
              max: 100,
              decimals: 0,
              gaugeWidthScale: 0.6,
              symbol:" %",
              relativeGaugeSize: true,
              levelColors:["#fc8403"]
          });
  }
}
function memory(data){
  var free_memory = data['freeMemory'];
  var byte_total_memory = data['totalMemory'];
  var total_memory = data['totalMemory'];
  var memory_used = total_memory - free_memory;
  var satuan_memory_used = ByteToDigitalStorageUnit_Computer(memory_used)['label'];
  var satuan_total_memory = ByteToDigitalStorageUnit_Computer(total_memory)['label'];
  var satuan_free_memory = ByteToDigitalStorageUnit_Computer(free_memory)['label'];
  total_memory = ByteToDigitalStorageUnit_Computer(total_memory)['value'];
  memory_used = ByteToDigitalStorageUnit_Computer(memory_used)['value'];
  free_memory = ByteToDigitalStorageUnit_Computer(free_memory)['value'];
  $("#total_memory").html(total_memory.toFixed(1) + " " + satuan_total_memory);
  $("#free_memory").html(free_memory.toFixed(1) + " " + satuan_free_memory);

  var max_gauge_total_memory = 0;
  if(satuan_memory_used == "KiB"){
    max_gauge_total_memory = ByteToKIB(byte_total_memory);
  }else if(satuan_memory_used == "MiB"){
    max_gauge_total_memory = ByteToMIB(byte_total_memory);
  }else if(satuan_memory_used == "GiB"){
    max_gauge_total_memory = ByteToGIB(byte_total_memory);
  }else if(satuan_memory_used == "TiB"){
    max_gauge_total_memory = ByteToTIB(byte_total_memory);
  }else if(satuan_memory_used == "PiB"){
    max_gauge_total_memory = ByteToPIB(byte_total_memory);
  }

  if(memory_gauge_chart != null){
    memory_gauge_chart.update({
      symbol:" " + satuan_memory_used,
    });
    memory_gauge_chart.refresh(memory_used,max_gauge_total_memory,0);
  }else{
    memory_gauge_chart = new JustGage({
      id: "memory_used",
      value: memory_used,
      min: 0,
      max: max_gauge_total_memory,
      decimals: 0,
      gaugeWidthScale: 0.6,
      symbol:" " + satuan_memory_used,
      relativeGaugeSize: true,
      decimals:1,
      levelColors:["#ffe600"]
    });
  }
}
function hdd(data){
  var free_hdd = data['freeHddSpace'];
  var total_hdd = data['totalHddSpace'];
  var byte_total_hdd = data['totalHddSpace'];
  var hdd_used = total_hdd - free_hdd;
  var satuan_hdd_used = ByteToDigitalStorageUnit_Computer(hdd_used)['label'];
  var satuan_total_hdd = ByteToDigitalStorageUnit_Computer(total_hdd)['label'];
  var satuan_free_hdd = ByteToDigitalStorageUnit_Computer(free_hdd)['label'];
  total_hdd = ByteToDigitalStorageUnit_Computer(total_hdd)['value'];
  hdd_used = ByteToDigitalStorageUnit_Computer(hdd_used)['value'];
  free_hdd = ByteToDigitalStorageUnit_Computer(free_hdd)['value'];
  $("#total_hdd").html(total_hdd.toFixed(1) + " " + satuan_total_hdd);
  $("#free_hdd").html(free_hdd.toFixed(1) + " " + satuan_free_hdd);

  var max_gauge_total_hdd = 0;
  if(satuan_hdd_used == "KiB"){
    max_gauge_total_hdd = ByteToKIB(byte_total_hdd);
  }else if(satuan_hdd_used == "MiB"){
    max_gauge_total_hdd = ByteToMIB(byte_total_hdd);
  }else if(satuan_hdd_used == "GiB"){
    max_gauge_total_hdd = ByteToGIB(byte_total_hdd);
  }else if(satuan_hdd_used == "TiB"){
    max_gauge_total_hdd = ByteToTIB(byte_total_hdd);
  }else if(satuan_hdd_used == "PiB"){
    max_gauge_total_hdd = ByteToPIB(byte_total_hdd);
  }

  if(hdd_gauge_chart != null){
    hdd_gauge_chart.update({
      symbol:" " + satuan_hdd_used,
    });
    hdd_gauge_chart.refresh(hdd_used,max_gauge_total_hdd,0);
  }else{
    hdd_gauge_chart = new JustGage({
      id: "hdd_used",
      value: hdd_used,
      min: 0,
      max: max_gauge_total_hdd,
      decimals: 0,
      gaugeWidthScale: 0.6,
      symbol:" " + satuan_hdd_used,
      relativeGaugeSize: true,
      decimals:1,
      levelColors:["#03c6fc"]
    });
  }
}
function system_health(){
  $.ajax({
    type:'post',
    url:'/ajax/system_health.html',
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
        if(data.hasOwnProperty("voltage")){
          $("#voltage").html(data['voltage'] + " V");
        }else{
          $("#voltage").hide();
        }
        $("#temperature").html(data['temperature'] + " &deg;C");
        setTimeout(function(){
          system_health();
        },1000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function interface_combobox(){
  $.ajax({
    type:'post',
    url:'/ajax/interface.html',
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
        var html_combo = "";
        $.each(data,function(k,v){
          html_combo += "<option value='" + v['name'] + "'>" + v['name'] + "</option>";
        });
        $("#interface").html(html_combo);
        $("#interface").select2({
        });
        $('#interface').on('select2:select', function (e) {
          if(interface_timeout != null){
            clearTimeout(interface_timeout);
            interface_timeout = null;
            interface_chart.destroy();
            interface_chart = null;
            interface();
          }
        });
        interface();
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function interface(){
  var interface_selected = $("#interface").val();
  $.ajax({
    type:'post',
    url:'/ajax/interface_traffic.html',
    data:{interface:interface_selected},
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
        func_interface_chart(data);
        interface_timeout = setTimeout(function(){
          interface();
        },5000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function func_interface_chart(data){
  var m = moment();
  var sekarang = m.format("HH:mm:ss");
  var tx_value = data[0]['txBitsPerSecond'];
  var rx_value = data[0]['rxBitsPerSecond'];
  var ctx = document.getElementById('interface_chart').getContext('2d');
  if(interface_chart != null){
    if(interface_chart.data.datasets[0].data.length > 4){
      interface_chart.data.labels.shift();
      interface_chart.data.datasets[0].data.shift();
      interface_chart.data.datasets[1].data.shift();
    }

    interface_chart.data.labels.push(sekarang);
    interface_chart.data.datasets[0].data.push(tx_value);
    interface_chart.data.datasets[1].data.push(rx_value);
    interface_chart.update();
  }else{
    interface_chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [sekarang],
            datasets: [{
                label: 'Tx',
                data: [tx_value],
                backgroundColor: 'rgba(100,150,255,0.5)',
  					    borderColor: 'rgba(100,150,255,1)'
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
                            var label_formatted = ByteToDigitalStorageUnit(label);
                            return label_formatted['value'].toFixed(2) + " " + label_formatted['label'].toLowerCase() + "ps";
                        }
                    }
                }]
            },
            tooltips: {
              mode:'x-axis',
              callbacks: {
                  label: function (tooltipItem, data) {
                      var label_formatted = ByteToDigitalStorageUnit(data.datasets[tooltipItem['datasetIndex']].data[tooltipItem.index]);
                      return data.datasets[tooltipItem['datasetIndex']]['label'] + " : " + label_formatted['value'].toFixed(2) + " " + label_formatted['label'].toLowerCase() + "ps";
                  }
              }
            }
        }
    });
  }
}
function netwatch(){
  $.ajax({
    type:'post',
    url:'/ajax/netwatch.html',
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
        var html = "";
        $.each(data,function(k,v){
          var bg_color = "";
          if(v['status'] == "up"){
            bg_color = "table-success";
          }else{
            bg_color = "table-danger";
          }
          var status = "";
          if(v['status'] == "up"){
            status = "<span class='badge badge-success'><i class='fa fa-arrow-up'></i> up</span>";
          }else{
            status = "<span class='badge badge-danger'><i class='fa fa-arrow-down'></i> down</span>";
          }
          var comment = "";
          if(v.hasOwnProperty("comment")){
            if(v['comment'] != ""){
              comment = "<br>#" + v['comment'];
            }
          }
          html += "<tr>";
          html += "<td>" + v['host'] + comment + "</td>";
          html += "<td>" + v['timeout'] + "</td>";
          html += "<td>" + v['interval'] + "</td>";
          html += "<td>" + status + "</td>";
          html += "</tr>";
        });
        $("#netwatch").html(html);
        setTimeout(function(){
          netwatch();
        },3000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
