var cur_bln = 0;
var cur_thn = 0;
var stat_chart = null;
var stat_ajax = null;
var member_stat_type = 1;
$(document).ready(function(){
  $("#filter_member").val("1");
  cur_bln = moment().format("M");
  cur_thn = moment().format("YYYY");
  member_stat_daily();
  $("#filter_member").change(function(){
    if($(this).val() == "1"){
      member_stat_type = 1;
      member_stat_daily();
    }else if($(this).val() == "2"){
      member_stat_type = 2;
      member_stat_monthly();
    }else if($(this).val() == "3"){
      member_stat_type = 3;
      member_stat_yearly();
    }
  });
  member_terbaru();
});
function member_stat_daily(){
  $("#title_statistik_member").html(" - " + IndexToMonth(parseInt(cur_bln) - 1) + " " + cur_thn);
  if(stat_ajax != null){
    stat_ajax.abort();
  }
  stat_ajax = $.ajax({
    type:'post',
    url:'/ajax/member_stat_inserted_daily.html',
    data:{bulan:cur_bln,tahun:cur_thn},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          // toastr["error"](res.msg);
          member_chart_daily([]);
          stat_ajax = null;
        }
      }else{
        var data = res.data;
        member_chart_daily(data);
        stat_ajax = null;
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
      stat_ajax = null;
    }
  });
}
function member_chart_daily(data){
    if(stat_chart != null){
      stat_chart.destroy();
    }
    var labels = [];
    var datas = [];
    for(var i=0;i<31;i++){
      labels.push((i + 1) + " " + IndexToMonth_Short(parseInt(cur_bln) - 1) + " " + cur_thn);
      var is_match = false;
      $.each(data,function(k,v){
        if(v['tgl'] == i){
          datas.push(v['jml']);
          is_match = true;
          return false;
        }
      });
      if(is_match == false){
        datas.push(0);
      }
    }
    var ctx = document.getElementById('member_chart');
    stat_chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: 'Data Member',
              data: datas,
              backgroundColor: 'rgba(100,255,150,0.5)',
              borderColor: 'rgba(100,255,150,1)'
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
                      maxTicksLimit:3,
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
                      var tgl = parseInt(tooltipItem['index']) + 1;
                      var label = tgl + " " + IndexToMonth(parseInt(cur_bln) - 1) + " " + cur_thn;
                      return label;
                  },
                  afterLabel: function(tooltipItem, data) {
                     return FormatAngka(tooltipItem['value']) + " member";
                  }
              }
            }
        }
    });
    var html = "";
    for(var i=0;i<31;i++){
      html += "<tr>";
      html += "<td style='width:1%' class='nowrap'>" + ((i + 1) + " " + IndexToMonth(parseInt(cur_bln) - 1) + " " + cur_thn) + "</td>";
      html += "<td style='width:1%' class='text-center nowrap'> : </td>";
      html += "<td class='text-right'>" + FormatAngka(datas[i]) + "</td>";
      html += "</tr>";
    }
    $("#member_chart_data").html(html);
}
function member_stat_monthly(){
  $("#title_statistik_member").html(" - " + cur_thn);
  if(stat_ajax != null){
    stat_ajax.abort();
  }
  stat_ajax = $.ajax({
    type:'post',
    url:'/ajax/member_stat_inserted_monthly.html',
    data:{tahun:cur_thn},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          // toastr["error"](res.msg);
          member_chart_monthly([]);
          stat_ajax = null;
        }
      }else{
        var data = res.data;
        member_chart_monthly(data);
        stat_ajax = null;
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
      stat_ajax = null;
    }
  });
}
function member_chart_monthly(data){
    if(stat_chart != null){
      stat_chart.destroy();
    }
    var labels = [];
    var datas = [];
    for(var i=0;i<12;i++){
      labels.push(IndexToMonth_Short(i));
      var is_match = false;
      $.each(data,function(k,v){
        if(v['bln'] == i){
          datas.push(v['jml']);
          is_match = true;
          return false;
        }
      });
      if(is_match == false){
        datas.push(0);
      }
    }
    var ctx = document.getElementById('member_chart');
    stat_chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: 'Data Member',
              data: datas,
              backgroundColor: 'rgba(100,255,150,0.5)',
              borderColor: 'rgba(100,255,150,1)'
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
                      var tgl = tooltipItem['index'];
                      var label = IndexToMonth(tgl) + " " + cur_thn;
                      return label;
                  },
                  afterLabel: function(tooltipItem, data) {
                     return FormatAngka(tooltipItem['value']) + " member";
                  }
              }
            }
        }
    });
    var html = "";
    for(var i=0;i<12;i++){
      html += "<tr>";
      html += "<td style='width:1%' class='nowrap'>" + (IndexToMonth(i) + " " + cur_thn) + "</td>";
      html += "<td style='width:1%' class='text-center nowrap'> : </td>";
      html += "<td class='text-right'>" + FormatAngka(datas[i]) + "</td>";
      html += "</tr>";
    }
    $("#member_chart_data").html(html);
}
function member_stat_yearly(){
  $("#title_statistik_member").html("");
  if(stat_ajax != null){
    stat_ajax.abort();
  }
  stat_ajax = $.ajax({
    type:'post',
    url:'/ajax/member_stat_inserted_yearly.html',
    data:{tahun:cur_thn},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          // toastr["error"](res.msg);
          member_chart_yearly([]);
          stat_ajax = null;
        }
      }else{
        var data = res.data;
        member_chart_yearly(data);
        stat_ajax = null;
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
      stat_ajax = null;
    }
  });
}
function member_chart_yearly(data){
    if(stat_chart != null){
      stat_chart.destroy();
    }
    var labels = [];
    var datas = [];
    for(var i=(cur_thn - 4);i<=cur_thn;i++){
      labels.push(i);
      var is_match = false;
      $.each(data,function(k,v){
        if(v['thn'] == i){
          datas.push(v['jml']);
          is_match = true;
          return false;
        }
      });
      if(is_match == false){
        datas.push(0);
      }
    }
    var ctx = document.getElementById('member_chart');
    stat_chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
              label: 'Data Member',
              data: datas,
              backgroundColor: 'rgba(100,255,150,0.5)',
              borderColor: 'rgba(100,255,150,1)'
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
                      var label = tooltipItem['label'];
                      return label;
                  },
                  afterLabel: function(tooltipItem, data) {
                     return FormatAngka(tooltipItem['value']) + " member";
                  }
              }
            }
        }
    });
    var html = "";
    var a = 0;
    for(var i=(cur_thn - 4);i<=cur_thn;i++){
      html += "<tr>";
      html += "<td style='width:1%' class='nowrap'>" + i + "</td>";
      html += "<td style='width:1%' class='text-center nowrap'> : </td>";
      html += "<td class='text-right'>" + FormatAngka(datas[a]) + "</td>";
      html += "</tr>";
      a++;
    }
    $("#member_chart_data").html(html);
}
function stat_member_prev(){
  if(member_stat_type == 1){
    //Harian
    if(cur_bln == 1){
      cur_bln = 12;
      cur_thn = parseInt(cur_thn) - 1;
    }else{
      cur_bln = parseInt(cur_bln) - 1;
    }
    member_stat_daily();
  }else if(member_stat_type == 2){
    //Bulanan
    cur_thn = parseInt(cur_thn) - 1;
    member_stat_monthly();
  }else if(member_stat_type == 3){
    //Tahunan
    cur_thn = parseInt(cur_thn) - 1;
    member_stat_yearly();
  }
}
function stat_member_next(){
  if(member_stat_type == 1){
    //Harian
    if(cur_bln == 12){
      cur_bln = 1;
      cur_thn = parseInt(cur_thn) + 1;
    }else{
      cur_bln = parseInt(cur_bln) + 1;
    }
    member_stat_daily();
  }else if(member_stat_type == 2){
    //Bulanan
    cur_thn = parseInt(cur_thn) + 1;
    member_stat_monthly();
  }else if(member_stat_type == 3){
    //Tahunan
    cur_thn = parseInt(cur_thn) + 1;
    member_stat_yearly();
  }
}

function member_terbaru(){
  $("#member_terbaru").loading();
  $.ajax({
    type:'post',
    url:'/ajax/member_terbaru.html',
    data:{tahun:cur_thn},
    success:function(resp){
      $("#member_terbaru").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#member_terbaru").html("<tr><td colspan='3'>" + res.msg + "</td></tr>");
        }
      }else{
        var html = "";
        $.each(res.data,function(k,v){
          var moment_tgl_insert = moment(v['tgl_insert'], "YYYY-MM-DD HH:mm:ss");
          var tgl_insert = "<span class='fa fa-clock-o'></span> " + moment_tgl_insert.format("HH") + ":" + moment_tgl_insert.format("mm") + "<br><span class='fa fa-calendar'></span> " + moment_tgl_insert.format("DD") + " " + IndexToMonth(parseInt(moment_tgl_insert.format("M")) - 1) + " " + moment_tgl_insert.format("YYYY");
          html += "<tr>";
          html += "<td>" + v['nama'] + "</td>";
          html += "<td>" + v['alamat'] + "</td>";
          html += "<td>" + tgl_insert + "</td>";
          html += "</tr>";
        });
        $("#member_terbaru").html(html);
      }
    },error:function(){
      $("#member_terbaru").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
