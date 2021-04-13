var page = 1;
var page2 = 1;
$(document).ready(function(){
  insert_data();
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data(true);
    }
  });
  $("#is_active").change(function(){
    page = 1;
    load_data(true);
  });
  load_data(true);
});
function load_data(with_loading){
  $("#pagination").html("");
  if(with_loading){
    $("#listdata").loading();
  }
  var keyword = $("#keyword").val();
  var is_active = $("#is_active").val();
  $.ajax({
    type:'post',
    url:'/ajax/ppp_secret.html',
    data:{keyword:keyword,page:page,is_active:is_active},
    success:function(resp){
      if(with_loading){
        $("#listdata").loading("stop");
      }
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='7'>" + res.msg + "</td></tr>");
          $("#info_page").html("0 - 0 dari 0");
        }
      }else{
        var data = res.data;
        var html = "";
        var no = (page * 10) - 9;
        var first = no;
        $.each(data,function(k,v){
          if(k < 10){
            var is_active = "";
            if(v['is_active'] == "1"){
              is_active = "<span class='fa fa-circle text-success'></span>";
            }else{
              is_active = "<span class='fa fa-circle text-danger'></span>";
            }
            html += "<tr>";
            html += "<td>" +  no + "</td>";
            html += "<td>" + v['name'] + "</td>";
            html += "<td>" + v['password'] + "</td>";
            html += "<td>" + v['profile'] + "</td>";
            html += "<td>" + v['local_address'] + "</td>";
            html += "<td>" + v['remote_address'] + "</td>";
            html += "<td class='text-center'>" + is_active + "</td>";
            html += "</tr>";
            no++;
          }
        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
        $("#info_page").html(first + " - " + (first + 9) + " dari " + FormatAngka(res.total));
        total_aktif();
      }
    },error:function(){
      if(with_loading){
        $("#listdata").loading("stop");
      }
      $("#info_page").html("0 - 0 dari 0");
      $("#listdata").html("<tr><td colspan='7'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function total_aktif(){
  $.ajax({
    type:'post',
    url:'/ajax/ppp_secret_total.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      var total = 0;
      var total_aktif = 0;
      var total_tidak_aktif = 0;
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          total_aktif = 0;
        }
      }else{
        var data = res.data[0];
        total = data['total'];
        total_aktif = data['total_aktif'];
      }
      var total_tidak_aktif = total - total_aktif;
      $("#total").html(FormatAngka(total));
      $("#total_aktif").html(FormatAngka(total_aktif));
      $("#total_tidak_aktif").html(FormatAngka(total_tidak_aktif));
    },error:function(){

    }
  });
}
function insert_data(){
  var load_loop = setInterval(function(){
    load_data(false);
  },4000);
  $.ajax({
    type:'post',
    url:'/ajax/ppp_secret_simpan.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#loader_insert_data").removeClass("d-inline-block");
          $("#loader_insert_data").addClass("d-none");
          toastr["error"](res.msg);
        }
      }else{
        $("#loader_insert_data").removeClass("d-inline-block");
        $("#loader_insert_data").addClass("d-none");
        clearInterval(load_loop);
        insert_data2();
      }
    },error:function(){
      $("#loader_insert_data").removeClass("d-inline-block");
      $("#loader_insert_data").addClass("d-none");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function insert_data2(){
  load_data(false);
  var load_loop_active_connection = setInterval(function(){
    load_data(false);
  },4000);
  $.ajax({
    type:'post',
    url:'/ajax/ppp_active_connection_simpan.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#loader_insert_data").removeClass("d-inline-block");
          $("#loader_insert_data").addClass("d-none");
          toastr["error"](res.msg);
        }
      }else{
        $("#loader_insert_data").removeClass("d-inline-block");
        $("#loader_insert_data").addClass("d-none");
        clearInterval(load_loop_active_connection);
        load_data(false);
      }
    },error:function(){
      $("#loader_insert_data").removeClass("d-inline-block");
      $("#loader_insert_data").addClass("d-none");
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
    load_data(true);
  });
  $(".nextpage").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data(true);
  });
}
