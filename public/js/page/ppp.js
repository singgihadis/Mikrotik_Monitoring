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
  $("#cbk_semua").click(function(){
    set_cbk_semua();
  });
  $("#cbk_semua_un").click(function(){
    localStorage.removeItem("data_hapus");
    localStorage.removeItem("is_checked_semua");
    load_data(true);
  });
});
function set_cbk_semua(){
  $("#cbk_semua").loading();
  $.ajax({
    type:'post',
    url:'/ajax/ppp_secret_tidak_ada.html',
    data:{},
    success:function(resp){
      $("#cbk_semua").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        var ids = res.data[0]['ids'];
        localStorage.setItem("is_checked_semua","1");
        localStorage.setItem("data_hapus",ids);
        load_data(true);
      }
    },error:function(){
      $("#cbk_semua").loading("stop");
      toastr['error']('Silahkan periksa koneksi internet anda');
    }
  });
}
function hapus(){
  var data_hapus = "";
  if(localStorage.getItem("data_hapus") !== null){
    data_hapus = localStorage.getItem("data_hapus");
  }
  if(data_hapus != ""){
    var r = confirm("Apa anda yakin ingin menghapus data yang dipilih? \nData yang terhubung menuju ke PPP otomatis tidak bisa diakses");
    if(r){
      $("#btn_hapus").loading();
      $.ajax({
        type:'post',
        url:'/ajax/ppp_secret_hapus.html',
        data:{ids:data_hapus},
        success:function(resp){
          $("#btn_hapus").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{

            }
          }else{
            localStorage.removeItem("is_checked_semua");
            localStorage.removeItem("data_hapus");
            toastr['success']('Berhasil menghapus');
            load_data(true);
          }
        },error:function(){
          $("#btn_hapus").loading("stop");
          toastr['error']('Silahkan periksa koneksi internet anda');
        }
      });
    }
  }else{
    toastr['error']('Silahkan pilih data yang akan dihapus');
  }
}
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
          $("#listdata").html("<tr><td colspan='8'>" + res.msg + "</td></tr>");
          $("#info_page").html("0 - 0 dari 0");
        }
      }else{
        var data_hapus = "";
        if(localStorage.getItem("data_hapus") !== null){
          data_hapus = localStorage.getItem("data_hapus");
        }
        var arr_data_hapus = [];
        if(data_hapus != ""){
          arr_data_hapus = data_hapus.split(",")
        }
        jml_hapus();
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
            html += "<td>" + (v['address'] != null?v['address']:"") + "</td>";
            html += "<td class='text-center'>" + is_active + "</td>";
            html += "<td class='text-center'>";
            if(v['is_ada'] == "0"){
              var checked = "";
              if($.inArray(v['id'].toString(),arr_data_hapus) !== -1){
                checked = "checked";
              }
              html += "<div class='custom-control custom-checkbox'>";
              html += "  <input data-id='" + v['id'] + "' " + checked + " type='checkbox' class='custom-control-input cbk_hapus' id='cbk_hapus" + k + "'>";
              html += "  <label class='custom-control-label' for='cbk_hapus" + k + "'></label>";
              html += "</div>";
            }
            html += "</td>";
            html += "</tr>";
            no++;
          }
        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
        $("#info_page").html(first + " - " + (no - 1) + " dari " + FormatAngka(res.total));
        total_aktif();
        $(".cbk_hapus").on("change",function(){
          var data_hapus = "";
          if(localStorage.getItem("data_hapus") !== null){
            data_hapus = localStorage.getItem("data_hapus");
          }
          var arr_data_hapus = [];
          if(data_hapus != ""){
            arr_data_hapus = data_hapus.split(",")
          }
          var id = $(this).attr("data-id");
          if($(this).is(":checked")){
            arr_data_hapus.push(id);
          }else{
            localStorage.removeItem("is_checked_semua");
            arr_data_hapus = removeArray(arr_data_hapus,id);
          }
          localStorage.setItem("data_hapus",arr_data_hapus.join(","));
          jml_hapus();
        });
      }
    },error:function(){
      if(with_loading){
        $("#listdata").loading("stop");
      }
      $("#info_page").html("0 - 0 dari 0");
      $("#listdata").html("<tr><td colspan='8'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function jml_hapus(){
  var data_hapus = "";
  if(localStorage.getItem("data_hapus") !== null){
    data_hapus = localStorage.getItem("data_hapus");
  }
  var arr_data_hapus = [];
  if(data_hapus != ""){
    arr_data_hapus = data_hapus.split(",")
  }
  $("#jml_hapus").html(FormatAngka(arr_data_hapus.length));
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

function cetak(itu){
  $(itu).find("span").removeClass("fa-file-pdf-o");
  $(itu).find("span").addClass("fa-spin");
  $(itu).find("span").addClass("fa-spinner");
  $(itu).addClass("disabled");
  $.ajax({
    type:'post',
    url:'/ajax/ppp_cetak_tidak_aktif.html',
    data:{},
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
