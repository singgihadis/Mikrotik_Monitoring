var page = 1;
$(document).ready(function(){
  $("#form_search").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  load_data();
  $("#form_data").validate({
    submitHandler:function(){
      var id = $("#id").val();
      if(id != ""){
        edit();
      }else{
        tambah();
      }
      return false;
    }
  });
  $("#form_alihkan").validate({
    submitHandler:function(){
      $("#form_alihkan").loading();
      var id = $("#alihkan_id").val();
      var user_id = $("#alihkan_user").val();
      $.ajax({
        type:'post',
        url:'/ajax/router_alihkan.html',
        data:{id:id,user_id:user_id},
        success:function(resp){
          $("#form_alihkan").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            $("#modal_alihkan").modal("hide");
            toastr["success"]("Berhasil mengalihkan");
            load_data();
          }
        },error:function(){
          $("#form_alihkan").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
});
function edit(){
  $("#form_data").loading();
  var id = $("#id").val();
  var nama = $("#nama").val();
  var host = $("#host").val();
  var port = $("#port").val();
  var user = $("#user").val();
  var password = $("#password").val();
  $.ajax({
    type:'post',
    url:'/ajax/router_edit.html',
    data:{id:id,nama:nama,host:host,port:port,user:user,password:password},
    success:function(resp){
      $("#form_data").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        $("#modal_form").modal("hide");
        toastr["success"]("Berhasil mengubah");
        load_data();
      }
    },error:function(){
      $("#form_data").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function tambah(){
  $("#form_data").loading();
  var nama = $("#nama").val();
  var host = $("#host").val();
  var port = $("#port").val();
  var user = $("#user").val();
  var password = $("#password").val();
  $.ajax({
    type:'post',
    url:'/ajax/router_tambah.html',
    data:{host:host,nama:nama,port:port,user:user,password:password},
    success:function(resp){
      $("#form_data").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"](res.msg);
        }
      }else{
        $("#modal_form").modal("hide");
        toastr["success"]("Berhasil menambah");
        load_data();
      }
    },error:function(){
      $("#form_data").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function modal_edit(itu){
  $("#form_data").trigger("reset");
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  var host = $(itu).attr("data-host");
  var port = $(itu).attr("data-port");
  var user = $(itu).attr("data-user");
  var password = $(itu).attr("data-password");
  $("#id").val(id);
  $("#nama").val(nama);
  $("#host").val(host);
  $("#port").val(port);
  $("#user").val(user);
  $("#password").val(password);
  $("#modal_form_title").html("Edit Data");
  $("#modal_form").modal("show");
}
function modal_alihkan(itu){
  $("#form_alihkan").trigger("reset");
  var id = $(itu).attr("data-id");
  var user_id = $(itu).attr("data-user-id");
  $("#alihkan_id").val(id);
  dropdown_user(user_id);
  $("#modal_alihkan").modal("show");
}
function dropdown_user(user_id){
  $.ajax({
    type:'post',
    url:'/ajax/user_data.html',
    data:{keyword:"",page:"x"},
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
        var html = "";
        $.each(res.data,function(k,v){
          if(user_id == v['id']){
            html += "<option value='" + v['id'] + "' selected='selected'>" + v['nama'] + "</option>";
          }else{
            html += "<option value='" + v['id'] + "'>" + v['nama'] + "</option>";
          }
        });
        $("#alihkan_user").html(html);
        $("#alihkan_user").select2({
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
function modal_tambah(){
  $("#form_data").trigger("reset");
  $("#id").val("");
  $("#nama").val("");
  $("#host").val("");
  $("#port").val("");
  $("#user").val("");
  $("#password").val("");
  $("#modal_form_title").html("Tambah Data");
  $("#modal_form").modal("show");
}
function load_data(){
  if($("#level").val() == "1"){
    $("#th_umum").show();
  }else{
    $("#th_admin").show();
  }
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/router_data.html',
    data:{keyword:keyword,page:page,is_pilih:"0"},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='7'>" + res.msg + "</td></tr>");
        }
      }else{
        var html = "";
        var no = page * 10 - 10;
        $.each(res.data,function(k,v){
          if(k < 10){
            no++;
            html += "<tr>";
            html += "<td>" + no + "</td>";
            if($("#level").val() == "2"){
              if(v['user_id'] == $("#user_id").val()){
                html += "<td><b>" + v['nama_user'] + "</b></td>";
              }else{
                html += "<td>" + v['nama_user'] + "</td>";
              }
            }
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['host'] + "</td>";
            html += "<td>" + v['port'] + "</td>";
            html += "<td>";
            if(v['user_id'] == $("#user_id").val()){
              html += "" + v['user'] + "";
            }
            html += "</td>";
            html += "<td>";
            if(v['user_id'] == $("#user_id").val()){
              html += "" + v['password'] + "";
            }
            html += "</td>";
            html += "<td>";
            if(v['user_id'] == $("#user_id").val()){
              html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-host='" + v['host'] + "' data-port='" + v['port'] + "' data-user='" + v['user'] + "' data-password='" + v['password'] + "' onclick='modal_edit(this);' class='btn btn-light'><span class='fa fa-edit'></span></a> ";
            }
            if($("#level").val() == "2"){
              html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama-user='" + v['nama_user'] + "' data-user-id='" + v['user_id'] + "' onclick='modal_alihkan(this);' class='btn btn-primary'><span class='fa fa-exchange'></span></a> ";
            }
            html += "</td>";
            html += "</tr>";
          }

        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#listdata").html("<tr><td colspan='7'>Silahkan periksa koneksi internet anda</td></tr>");
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
    load_data();
  });
  $(".nextpage").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page = get_page;
    load_data();
  });
}
