var page = 1;
var is_edit = false;
$(document).ready(function(){
  $('#file_favicon').on('change',function(){
               var fileName = $(this).val();
               $(this).next('.custom-file-label').html(fileName);
  });
  $('#file_logo').on('change',function(){
               var fileName = $(this).val();
               $(this).next('.custom-file-label').html(fileName);
  });
  $("#form_pengaturan").validate({
    submitHandler:function(){
      $("#form_pengaturan").loading();
      var title = $("#title").val();
      var bank = $("#bank").val();
      var website = $("#website").val();
      var email = $("#email").val();
      var no_wa = $("#no_wa").val();
      var data = new FormData();
      data.append("title",title);
      data.append("bank",bank);
      data.append("website",website);
      data.append("email",email);
      data.append("no_wa",no_wa);
      if($('#file_favicon')[0].files.length > 0){
        data.append('favicon', $('#file_favicon')[0].files[0]);
      }
      if($('#file_logo')[0].files.length > 0){
        data.append('logo', $('#file_logo')[0].files[0]);
      }
      $.ajax({
        type:'post',
        url:'/ajax/pengaturan_simpan.html',
        cache: false,
        contentType: false,
        processData: false,
        data:data,
        success:function(resp){
          $("#form_pengaturan").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            toastr["success"]("Berhasil simpan data");
            setTimeout(function(){
              window.location.reload();
            },1000);
          }
        },error:function(){
          $("#form_pengaturan").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  get_data();
  $("#form_search").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  load_data();
  $("#form_data").validate({
    submitHandler:function(){
      if(is_edit){
        edit();
      }else{
        tambah();
      }
      return false;
    }
  });
});
function get_data(){
  $("#form_pengaturan").loading();
  $.ajax({
    type:'post',
    url:'/ajax/pengaturan.html',
    data:{},
    success:function(resp){
      $("#form_pengaturan").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        var data = res.data[0];
        $("#title").val(data['title']);
        if(data['favicon'] != ""){
          $("#favicon").attr("src",data['favicon']);
        }
        if(data['logo'] != ""){
          $("#logo").attr("src",data['logo']);
        }
        $("#bank").val(data['bank']);
        $("#website").val(data['website']);
        $("#email").val(data['email']);
        $("#no_wa").val(data['no_wa']);
      }
    },error:function(){
      $("#form_pengaturan").loading("stop");
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
    url:'/ajax/bank_data.html',
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
        var no = page * 5 - 5;
        $.each(res.data,function(k,v){
          if(k < 5){
            no++;
            html += "<tr>";
            html += "<td>" + no + "</td>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['no_rekening'] + "</td>";
            html += "<td>";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-no-rekening='" + v['no_rekening'] + "' onclick='modal_edit(this);' class='btn btn-light'><span class='fa fa-edit'></span></a> ";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' onclick='hapus(this);' class='btn btn-danger'><span class='fa fa-trash'></span></a>";
            html += "</td>";
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
function tambah(){
  $("#form_data").loading();
  var nama = $("#nama").val();
  var no_rekening = $("#no_rekening").val();
  $.ajax({
    type:'post',
    url:'/ajax/bank_tambah.html',
    data:{nama:nama,no_rekening:no_rekening},
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
        toastr["success"]("Berhasil menambahkan");
        page = 1;
        load_data();
      }
    },error:function(){
      $("#form_data").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function edit(){
  $("#form_data").loading();
  var id = $("#id").val();
  var nama = $("#nama").val();
  var no_rekening = $("#no_rekening").val();
  $.ajax({
    type:'post',
    url:'/ajax/bank_edit.html',
    data:{id:id,nama:nama,no_rekening:no_rekening},
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
function hapus(itu){
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
              url:'/ajax/bank_hapus.html',
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
                  toastr["success"]("Berhasil menghapus");
                  load_data();
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
function modal_tambah(){
  is_edit = false;
  $("#form_data").trigger("reset");
  $("#modal_form_title").html("Tambah Bank");
  $("#modal_form").modal("show");
}
function modal_edit(itu){
  $("#form_data").trigger("reset");
  is_edit = true;
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  var no_rekening = $(itu).attr("data-no-rekening");
  $("#modal_form_title").html("Edit Bank");
  $("#id").val(id);
  $("#nama").val(nama);
  $("#no_rekening").val(no_rekening);
  $("#modal_form").modal("show");
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
