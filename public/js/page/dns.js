var page = 1;
$(document).ready(function(){
  insert_data();
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data(true);
    }
  });
  load_data(true);
});
function load_data(with_loading){
  $("#pagination").html("");
  if(with_loading){
    $("#listdata").loading();
  }
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/dns_cache.html',
    data:{keyword:keyword,page:page},
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
          $("#listdata").html("<tr><td colspan='5'>" + res.msg + "</td></tr>");
          $("#info_page").html("0 - 0 dari 0");
        }
      }else{
        var data = res.data;
        var html = "";
        var no = (page * 10) - 9;
        var first = no;
        $.each(data,function(k,v){
          if(k < 10){
            html += "<tr>";
            html += "<td>" +  no + "</td>";
            html += "<td>" + v['name'] + "</td>";
            html += "<td>" + v['type'] + "</td>";
            html += "<td>" + v['data'] + "</td>";
            html += "<td class='text-nowrap'>" + ParseDNSCacheTime(v['ttl']) + "</td>";
            html += "</tr>";
            no++;
          }
        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
        $("#info_page").html(first + " - " + (no - 1) + " dari " + FormatAngka(res.total));
      }
    },error:function(){
      if(with_loading){
        $("#listdata").loading("stop");
      }
      $("#info_page").html("0 - 0 dari 0");
      $("#listdata").html("<tr><td colspan='5'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function insert_data(){
  var load_loop = setInterval(function(){
    load_data(false);
  },4000);
  $.ajax({
    type:'post',
    url:'/ajax/dns_cache_simpan.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
          $("#loader_insert_data").removeClass("d-inline-block");
          $("#loader_insert_data").addClass("d-none");
        }
      }else{
        $("#loader_insert_data").removeClass("d-inline-block");
        $("#loader_insert_data").addClass("d-none");
        clearInterval(load_loop);
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
function export_txt(){
  var keyword = $("#keyword").val();
  window.open("/dns/export.txt?k=" + keyword,"_blank");
}
