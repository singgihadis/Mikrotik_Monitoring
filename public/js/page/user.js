var page = 1;
var is_edit = false;
var is_edit_password = false;
$(document).ready(function(){
  $('#file_npwp').on('change',function(){
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
  });
  $('#file_ktp').on('change',function(){
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
  });
  $("#form_search").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  load_data();
  $("#password").keyup(function(){
    $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
  });
  $("#password").blur(function(){
    $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
  });
  $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
  $("#form_data").validate({
    submitHandler:function(){
      if(is_edit){
        if(is_edit_password){
          edit_password();
        }else{
          edit();
        }
      }else{
        tambah();
      }
      return false;
    }
  });
  $("#level").change(function(){
    if($(this).val() == "3" || $(this).val() == "4"){
      $("#div_parent_user_id").show();
      dropdown_user("");
    }else{
      $("#div_parent_user_id").hide();
    }
  });
});
function tambah(){
  $("#form_data").loading();
  var nama = $("#nama").val();
  var user = $("#user").val();
  var level = $("#level").val();
  var password = $("#hidden_password").val();
  var parent_user_id = "0";
  if(level == "3" || level == "4"){
    parent_user_id = $("#parent_user_id").val();
  }
  var nik = $("#nik").val();
  var email = $("#email").val();
  var alamat = $("#alamat").val();
  var data = new FormData();
  data.append("id",id);
  data.append("nama",nama);
  data.append("user",user);
  data.append("level",level);
  data.append("parent_user_id",parent_user_id);
  data.append("nik",nik);
  data.append("email",email);
  data.append("alamat",alamat);
  if($('#file_npwp')[0].files.length > 0){
    data.append('file_npwp', $('#file_npwp')[0].files[0]);
  }
  if($('#file_ktp')[0].files.length > 0){
    data.append('file_ktp', $('#file_ktp')[0].files[0]);
  }
  $.ajax({
    type:'post',
    url:'/ajax/user_tambah.html',
    cache: false,
    contentType: false,
    processData: false,
    data:data,
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
  var user = $("#user").val();
  var level = $("#level").val();
  var nik = $("#nik").val();
  var email = $("#email").val();
  var alamat = $("#alamat").val();
  var password = $("#hidden_password").val();
  var parent_user_id = "0";
  if(level == "3" || level == "4"){
    parent_user_id = $("#parent_user_id").val();
  }
  var data = new FormData();
  data.append("id",id);
  data.append("nama",nama);
  data.append("user",user);
  data.append("level",level);
  data.append("password",password);
  data.append("parent_user_id",parent_user_id);
  data.append("nik",nik);
  data.append("email",email);
  data.append("alamat",alamat);
  if($('#file_npwp')[0].files.length > 0){
    data.append('file_npwp', $('#file_npwp')[0].files[0]);
  }
  if($('#file_ktp')[0].files.length > 0){
    data.append('file_ktp', $('#file_ktp')[0].files[0]);
  }
  $.ajax({
    type:'post',
    url:'/ajax/user_edit.html',
    cache: false,
    contentType: false,
    processData: false,
    data:data,
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
function edit_password(){
  $("#form_data").loading();
  var id = $("#id").val();
  var password = $("#hidden_password").val();
  $.ajax({
    type:'post',
    url:'/ajax/user_edit_password.html',
    data:{id:id,password:password},
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
              url:'/ajax/user_hapus.html',
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
  $("#modal_form_title").html("Tambah User");
  $("#div_password").show();
  $("#div_nama").show();
  $("#div_nik").show();
  $("#div_email").show();
  $("#div_alamat").show();
  $("#div_file_npwp").show();
  $("#div_file_ktp").show();
  $("#div_user").show();
  $("#div_level").show();
  $("#div_parent_user_id").hide();
  $("#img_npwp").attr("src","");
  $("#img_ktp").attr("src","");
  $("#modal_form").modal("show");
}
function modal_edit(itu){
  $("#form_data").trigger("reset");
  is_edit = true;
  is_edit_password = false;
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  var user = $(itu).attr("data-user");
  var level = $(itu).attr("data-level");
  var parent_user_id = $(itu).attr("data-parent-user-id");
  var nik = $(itu).attr("data-nik");
  var email = $(itu).attr("data-email");
  var alamat = $(itu).attr("data-alamat");
  var file_npwp = $(itu).attr("data-file-npwp");
  var file_ktp = $(itu).attr("data-file-ktp");
  $("#modal_form_title").html("Edit User");
  $("#div_password").hide();
  $("#div_nama").show();
  $("#div_nik").show();
  $("#div_email").show();
  $("#div_alamat").show();
  $("#div_file_npwp").show();
  $("#div_file_ktp").show();
  $("#div_user").show();
  $("#div_level").show();
  $("#id").val(id);
  $("#nama").val(nama);
  $("#user").val(user);
  $("#level").val(level);
  $("#nik").val(nik);
  $("#email").val(email);
  $("#alamat").val(alamat);
  if(file_npwp != ""){
    $("#img_npwp").attr("src",file_npwp);
  }
  if(file_ktp != ""){
    $("#img_ktp").attr("src",file_ktp);
  }
  $("#modal_form").modal("show");
  if(level == "3" || level == "4"){
    $("#div_parent_user_id").show();
    dropdown_user(parent_user_id);
  }
}
function modal_password(itu){
  is_edit = true;
  is_edit_password = true;
  var id = $(itu).attr("data-id");
  $("#modal_form_title").html("Update Password");
  $("#id").val(id);
  $("#div_password").show();
  $("#div_nama").hide();
  $("#div_user").hide();
  $("#div_level").hide();
  $("#div_nik").hide();
  $("#div_email").hide();
  $("#div_alamat").hide();
  $("#div_file_npwp").hide();
  $("#div_file_ktp").hide();
  $("#div_parent_user_id").hide();
  $("#password").val("");
  $("#modal_form").modal("show");
}
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/user_data.html',
    data:{keyword:keyword,page:page},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='5'>" + res.msg + "</td></tr>");
        }
      }else{
        var html = "";
        var no = page * 10 - 10;
        $.each(res.data,function(k,v){
          if(k < 10){
            no++;
            var level = "";
            if(v['level'] == "1"){
              level = "Umum";
            }else if(v['level'] == "2"){
              level = "Admin";
            }else if(v['level'] == "3"){
              level = "Keuangan";
            }else if(v['level'] == "4"){
              level = "Teknisi";
            }
            html += "<tr>";
            html += "<td>" + no + "</td>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['user'] + "</td>";
            html += "<td>" + level + "</td>";
            html += "<td>";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' onclick='modal_password(this);' class='btn btn-primary'><span class='fa fa-key'></span></a> ";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-file-npwp='" + v['file_npwp'] + "' data-file-ktp='" + v['file_ktp'] + "' data-nik='" + v['nik'] + "' data-email='" + v['email'] + "' data-alamat='" + v['alamat'] + "' data-user='" + v['user'] + "' data-level='" + v['level'] + "' data-parent-user-id='" + v['parent_user_id'] + "' onclick='modal_edit(this);' class='btn btn-light'><span class='fa fa-edit'></span></a> ";
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
      $("#listdata").html("<tr><td colspan='5'>Silahkan periksa koneksi internet anda</td></tr>");
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
function dropdown_user(parent_user_id){
  $("#div_parent_user_id").loading();
  $.ajax({
    type:'post',
    url:'/ajax/user_data.html',
    data:{keyword:"",page:"x",level:"1"},
    success:function(resp){
      $("#div_parent_user_id").loading("stop");
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
          html += "<option value='" + v['id'] + "'>" + v['nama'] + "</option>";
        });
        $("#parent_user_id").html(html);
        if(parent_user_id != ""){
          $("#parent_user_id").val(parent_user_id);
        }
      }
    },error:function(){
      $("#div_parent_user_id").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
