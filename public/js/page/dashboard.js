var cpu_gauge_chart = null;
var memory_gauge_chart = null;
var hdd_gauge_chart = null;
var bad_blocks_gauge_chart = null;
var interface_chart = null;
var interface_timeout = null;
$(document).ready(function(){
  system_resources();
  system_health();
  interface_combobox();
  netwatch();
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
        bad_blocks(data);
        setTimeout(function(){
          system_resources();
        },1000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
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
  var total_memory = data['totalMemory'];
  var memory_used = total_memory - free_memory;
  var satuan_memory_used = ByteToDigitalStorageUnit(memory_used)['label'];
  var satuan_total_memory = ByteToDigitalStorageUnit(total_memory)['label'];
  var satuan_free_memory = ByteToDigitalStorageUnit(free_memory)['label'];
  total_memory = ByteToDigitalStorageUnit(total_memory)['value'];
  memory_used = ByteToDigitalStorageUnit(memory_used)['value'];
  free_memory = ByteToDigitalStorageUnit(free_memory)['value'];
  $("#total_memory").html(total_memory.toFixed(1) + " " + satuan_total_memory);
  $("#free_memory").html(free_memory.toFixed(1) + " " + satuan_free_memory);
  if(memory_gauge_chart != null){
    memory_gauge_chart.update({
      symbol:" " + satuan_memory_used,
    });
    memory_gauge_chart.refresh(memory_used,total_memory,0);
  }else{
    memory_gauge_chart = new JustGage({
      id: "memory_used",
      value: memory_used,
      min: 0,
      max: total_memory,
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
  var hdd_used = total_hdd - free_hdd;
  var satuan_hdd_used = ByteToDigitalStorageUnit_Computer(hdd_used)['label'];
  var satuan_total_hdd = ByteToDigitalStorageUnit_Computer(total_hdd)['label'];
  var satuan_free_hdd = ByteToDigitalStorageUnit_Computer(free_hdd)['label'];
  total_hdd = ByteToDigitalStorageUnit_Computer(total_hdd)['value'];
  hdd_used = ByteToDigitalStorageUnit_Computer(hdd_used)['value'];
  free_hdd = ByteToDigitalStorageUnit_Computer(free_hdd)['value'];
  $("#total_hdd").html(total_hdd.toFixed(1) + " " + satuan_total_hdd);
  $("#free_hdd").html(free_hdd.toFixed(1) + " " + satuan_free_hdd);
  if(hdd_gauge_chart != null){
    hdd_gauge_chart.update({
      symbol:" " + satuan_hdd_used,
    });
    hdd_gauge_chart.refresh(hdd_used,total_hdd,0);
  }else{
    hdd_gauge_chart = new JustGage({
      id: "hdd_used",
      value: hdd_used,
      min: 0,
      max: total_hdd,
      decimals: 0,
      gaugeWidthScale: 0.6,
      symbol:" " + satuan_hdd_used,
      relativeGaugeSize: true,
      decimals:1,
      levelColors:["#03c6fc"]
    });
  }
}
function bad_blocks(data){
  var bad_blocks = data['badBlocks'];
  var sector_writes_since_rebort = data['writeSectSinceReboot'];
  var total_sector_writes = data['writeSectTotal'];
  $("#sector_writes_since_rebort").html(FormatAngka(sector_writes_since_rebort));
  $("#total_sector_writes").html(FormatAngka(total_sector_writes));
  if(bad_blocks_gauge_chart != null){
    bad_blocks_gauge_chart.refresh(bad_blocks);
  }else{
    bad_blocks_gauge_chart = new JustGage({
      id: "bad_blocks",
      value: bad_blocks,
      min: 0,
      max: 100,
      decimals: 0,
      gaugeWidthScale: 0.6,
      symbol:" %",
      relativeGaugeSize: true,
      decimals:1,
      label:"Bad Blocks",
      levelColors:["#000000"]
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
        $("#voltage").html(data['voltage'] + " V");
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
