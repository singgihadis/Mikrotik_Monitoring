var page = 1;
var ping_chart_timeout = {};
var ping_chart_graph = {};
var where = "";
$(document).ready(function(){
  load_data();
});
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/monitoring_data.html',
    data:{keyword:keyword,page:page,is_run:"1"},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='4'>" + res.msg + "</td></tr>");
        }
      }else{
        var html = "";
        if($("#data_graphic" + page).length == 0){
          $("#data").append("<div id='data_graphic" + page + "' class='data-graphic'></div>")
          var no = 0;
          $.each(res.data,function(k,v){
            if(k < 5){
              no++;
              $("#data_graphic" + page).append("<div id='listdata_graphic" + page + "_" + no + "' class='row'></div>");
              ping_build_card(no,v);
            }
          });
        }
        if(where == "0"){
          $("#data_graphic" + (page + 1)).animate({
            'margin-right' : "-100%",
            'opacity' : '0'
          }, 500,function(){
            $("#data_graphic" + (page + 1)).hide();
          });
          $("#data_graphic" + page).show();
          $("#data_graphic" + page).animate({
            'margin-left' : "0%",
            'opacity' : '100'
           }, 500,function(){

           });
        }else if(where == "1"){
            $("#data_graphic" + (page - 1)).animate({
              'margin-left' : "-100%",
              'opacity' : '0'
              }, 500,function(){
                $("#data_graphic" + (page - 1)).hide();
            });
            $("#data_graphic" + page).show();
            $("#data_graphic" + page).animate({
              'margin-right' : "0%",
              'opacity' : '100'
              }, 500,function(){

            });
        }else{
          $("#data_graphic" + page).show();
        }
        html_pagination(res.data.length);
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#listdata").html("<tr><td colspan='4'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function ping_build_card(no,v){
  var nama = v['nama'];
  var id = v['id'];
  var client_ip = v['client_ip'];
  var high_value = v['normal_value'];
  var unik = client_ip.replace(/\./g,"");
  var html_graph_card = "";
  html_graph_card += "<div id='ping_" + unik + "' class='col-md-12 mb-3'>";
  html_graph_card += "  <div class='card stat-card'>";
  html_graph_card += "    <div class='card-body'>";
  html_graph_card += "			<div class='text-right'>";
  html_graph_card += "				<form class='form_tgl'>";
  html_graph_card += "					<div class='form-group d-inline-block'>";
  html_graph_card += "						<div class='input-group input-group-sm'>";
  html_graph_card += "							<div class='input-group-prepend'>";
  html_graph_card += "								<span class='input-group-text bg-primary text-white'>";
  html_graph_card += "									<i class='fa fa-calendar'></i>";
  html_graph_card += "								</span>";
  html_graph_card += "							</div>";
  html_graph_card += "							<input type='text' data-id='" + id + "' data-clientip='" + client_ip + "' data-unik='" + unik + "' data-highvalue='" + high_value + "' name='tgl' id='tgl' class='daterange form-control' placeholder='Tgl' />";
  html_graph_card += "							<div class='input-group-append '>";
  html_graph_card += "								<button class='btn btn-danger clear' data-clientip='" + client_ip + "' data-unik='" + unik + "' data-highvalue='" + high_value + "' type='button'>Clear</button>";
  html_graph_card += "							</div>";
  html_graph_card += "						</div>";
  html_graph_card += "					</div>";
  html_graph_card += "				</form>";
  html_graph_card += "			</div>";
  html_graph_card += "    <div class='text-left'><b>IP : " + client_ip + " - " + nama + "</b></div>";
  html_graph_card += "    <canvas id='chart_" + unik + "' height='50'></canvas>";
  html_graph_card += "    </div>";
  html_graph_card += "  </div>";
  html_graph_card += "</div>";
  $("#listdata_graphic" + page + "_" + no).append(html_graph_card);
  $(".daterange").daterangepicker({
    autoUpdateInput: false,
    opens: 'left',
    timePicker: true,
    timePicker24Hour: true
  }, function (start, end, label) {

  });
  $(".clear").click(function(){
    $(this).parent().parent().find("input").val("");
    var client_ip = $(this).attr("data-clientip");
    var unik = $(this).attr("data-unik");
    var highvalue = $(this).attr("data-highvalue");
    ping_chart_graph[unik].destroy();
    ping_chart_graph[unik] = null;
    ping_chart_data(client_ip,high_value,unik);
  });
  $('.daterange').on('apply.daterangepicker', function(ev, picker) {
    $(this).val(picker.startDate.format('DD/MM/YYYY HH:mm') + ':00 - ' + picker.endDate.format('DD/MM/YYYY HH:mm') + ":00");
    var unik = $(this).attr("data-unik");
    var highvalue = $(this).attr("data-highvalue");
    var id = $(this).attr("data-id");
    ping_chart_database(id,picker.startDate.format('YYYY-MM-DD'),picker.endDate.format('YYYY-MM-DD'),picker.startDate.format('YYYY-MM-DD HH:mm') + ":00",picker.endDate.format('YYYY-MM-DD HH:mm') + ":00",high_value,unik);
  });
  ping_chart_data(client_ip,high_value,unik);
}
function ping_chart_database(id,tgl_start,tgl_end,tgl_start_complete,tgl_end_complete,high_value,unik){
  $.ajax({
    type:'post',
    url:'/ajax/ping_data.html',
    data:{id:id,tgl_start:tgl_start,tgl_end:tgl_end},
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
        ping_chart_graph[unik].destroy();
        ping_chart_graph[unik] = null;
        if(ping_chart_timeout[unik] != undefined){
          clearTimeout(ping_chart_timeout[unik]);
        }
        ping_chart2(data,tgl_start_complete,tgl_end_complete,unik,high_value);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function ping_chart_data(client_ip,high_value,unik){
  $.ajax({
    type:'post',
    url:'/ajax/ping.html',
    data:{client_ip:client_ip,high_value:high_value},
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
        ping_chart(data,unik);
        ping_chart_timeout[unik] = setTimeout(function(){
          ping_chart_data(client_ip,high_value,unik);
        },5000);
      }
    },error:function(){
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function ping_chart(data,unik){
  var m = moment();
  var sekarang = m.format("HH:mm:ss");
  var time = "0ms";
  if(data.hasOwnProperty("time")){
    time = data['time'];
  }
  var ping_value = time.replace("ms","");

  var backgroundColor = "rgba(100,150,255,0.5)";
  var borderColor = "rgba(100,150,255,1)";
  if(ping_value > data['high_value'] || ping_value <= 0){
    backgroundColor = "rgba(255,100,100,0.5)";
    borderColor = "rgba(255,100,100,1)";
  }

  var ctx = document.getElementById('chart_' + unik).getContext('2d');
  if(ping_chart_graph[unik] != null){
    if(ping_chart_graph[unik].data.datasets[0].data.length > 10){
      ping_chart_graph[unik].data.labels.shift();
      ping_chart_graph[unik].data.datasets[0].backgroundColor.shift();
      ping_chart_graph[unik].data.datasets[0].borderColor.shift();
      ping_chart_graph[unik].data.datasets[0].data.shift();
    }

    ping_chart_graph[unik].data.labels.push(sekarang);
    ping_chart_graph[unik].data.datasets[0].data.push(ping_value);
    ping_chart_graph[unik].data.datasets[0].backgroundColor.push(backgroundColor);
    ping_chart_graph[unik].data.datasets[0].borderColor.push(borderColor);
    ping_chart_graph[unik].update();
  }else{
    ping_chart_graph[unik] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [sekarang],
            datasets: [{
                label: 'Time',
                data: [ping_value],
                backgroundColor: [backgroundColor],
  					    borderColor: [borderColor]
            }]
        },
        options: {
          // elements: {
          //           point:{
          //               radius: 0
          //           }
          //       },
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        maxTicksLimit:3,
                        callback: function(label, index, labels) {
                            return label + " ms";
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
                      return data.datasets[tooltipItem['datasetIndex']]['label'] + " : " + data.datasets[tooltipItem['datasetIndex']].data[tooltipItem.index] + " ms";
                  }
              }
            }
        }
    });
  }
}
function ping_chart2(data,tgl_start_complete,tgl_end_complete,unik,high_value){
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
  var ping_values = [];
  var backgroundColors = [];
  var borderColors = [];
  $.each(datas,function(k,v){
    var timestamp = v['s'];
    var time_timestamp = timestamp;
    var time_tgl_start_complete = moment(tgl_start_complete,"YYYY-MM-DD HH:mm:ss").unix();
    var time_tgl_end_complete = moment(tgl_end_complete,"YYYY-MM-DD HH:mm:ss").unix();
    if(time_timestamp >= time_tgl_start_complete && time_timestamp <= time_tgl_end_complete){
      labels.push(moment.unix(timestamp).format("DD-MM-YYYY (HH:mm)"));
      var time = "0ms";
      if(v['t'] != ""){
        time = v['t'];
      }
      var ping_value = parseInt(time.replace("ms",""));
      ping_values.push(ping_value);
      if(ping_value > high_value || ping_value <= 0){
        backgroundColors.push("rgba(255,100,100,0.5)");
        borderColors.push("rgba(255,100,100,1)");
      }else{
        backgroundColors.push("rgba(100,150,255,0.5");
        borderColors.push("rgba(100,150,255,1)");
      }
    }

  });

  var ctx = document.getElementById('chart_' + unik).getContext('2d');
  ping_chart_graph[unik] = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Time',
              data: ping_values,
              backgroundColor: backgroundColors,
              borderColor: borderColors
          }]
      },
      options: {
        elements: {
                  point:{
                      radius: 0
                  }
              },
          legend: {
              display: false
          },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true,
                      maxTicksLimit:3,
                      callback: function(label, index, labels) {
                          return label + " ms";
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
                    return data.datasets[tooltipItem['datasetIndex']]['label'] + " : " + data.datasets[tooltipItem['datasetIndex']].data[tooltipItem.index] + " ms";
                }
            }
          }
      }
  });
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
    where = "0";
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data();
  });
  $(".nextpage").click(function(e){
    e.preventDefault();
    where = "1";
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data();
  });
}
