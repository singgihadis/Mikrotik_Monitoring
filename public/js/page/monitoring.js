var page = 1;
var ping_chart_timeout = {};
var ping_chart_graph = {};
$(document).ready(function(){
  $("#form_monitoring").validate({
    rules: {
        client_ip: {
          required: true,
          validIP: true
        },
        normal_value_start: { required: true },
        normal_value_end: { required: true }
    },
    groups: {
        normal_value: "normal_value_start normal_value_end"
    },
    errorPlacement: function(error, element) {
      if (element.attr("name") == "normal_value_start" || element.attr("name") == "normal_value_end"){
        error.insertAfter(element.parent());
      }else{
        error.insertAfter(element);
      }
    },
    submitHandler:function(){
      tambah();
    }
  });
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  load_data();
});
function tambah(){
  $("#form_monitoring").loading();
  var nama = $("#nama").val();
  var client_ip = $("#client_ip").val();
  var normal_value = $("#normal_value_start").val() + " - " + $("#normal_value_end").val();
  var high_value = $("#normal_value_end").val();
  $.ajax({
    type:'post',
    url:'/ajax/monitoring_tambah.html',
    data:{nama:nama,client_ip:client_ip,normal_value:normal_value,high_value:high_value},
    success:function(resp){
      $("#form_monitoring").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        toastr["success"]("Berhasil menambahkan");
        page = 1;
        load_data();
      }
    },error:function(){
      $("#form_monitoring").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/monitoring_data.html',
    data:{keyword:keyword,page:page},
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
        $.each(res.data,function(k,v){
          if(k < 5){
            html += "<tr>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['client_ip'] + "</td>";
            html += "<td>" + v['normal_value'] + "</td>";
            if(v['is_run'] == "1"){
              html += "<td><a href='javascript:void(0);' onclick='ping_stop(this)' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-client-ip='" + v['client_ip'] + "' data-high-value='" + v['high_value'] + "' class='btn btn-danger'><span class='fa fa-stop-circle'></span> Ping</a><td>";
            }else{
              html += "<td><a href='javascript:void(0);' onclick='ping_run(this)' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-client-ip='" + v['client_ip'] + "' data-high-value='" + v['high_value'] + "' class='btn btn-primary'><span class='fa fa-wifi'></span> Ping</a><td>";
            }
            html += "</tr>";
          }

        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#listdata").html("<tr><td colspan='4'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function ping_run(itu){
  $(itu).parent().parent().loading();
  var id = $(itu).attr("data-id");
  $.ajax({
    type:'post',
    url:'/ajax/ping_run.html',
    data:{id:id},
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
        toastr["success"]("Berhasil menjalankan");
        $(itu).attr("onclick","ping_stop(this)");
        $(itu).removeClass("btn-primary");
        $(itu).addClass("btn-danger");
        $(itu).html("<span class='fa fa-stop-circle'></span> Ping");
      }
    },error:function(){
      $(itu).parent().parent().loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function ping_stop(itu){
  $(itu).parent().parent().loading();
  var id = $(itu).attr("data-id");
  $.ajax({
    type:'post',
    url:'/ajax/ping_stop.html',
    data:{id:id},
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
        toastr["success"]("Berhasil menghentikan");
        $(itu).attr("onclick","ping_run(this)");
        $(itu).removeClass("btn-danger");
        $(itu).addClass("btn-primary");
        $(itu).html("<span class='fa fa-wifi'></span> Ping");
      }
    },error:function(){
      $(itu).parent().parent().loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
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
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data();
  });
  $(".nextpage").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data();
  });
}
