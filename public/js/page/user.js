var page = 1;
var is_edit = false;
var is_edit_password = false;
var page_file = 1;
$(document).ready(function(){
  var user_level = $("#user_level").val();
  if(user_level == "1"){
    $("#level").find("option[value='2']").remove();
  }
  $('#file_npwp').on('change',function(){
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
  });
  $('#file_ktp').on('change',function(){
    var fileName = $(this).val();
    $(this).next('.custom-file-label').html(fileName);
  });
  $('#file_file').on('change',function(){
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
  $("#form_data").validate({
    submitHandler:function(){
      $("#hidden_password").val(CryptoJS.MD5($("#password").val()));
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
  $("#form_mou").validate({
    submitHandler:function(){
      $("#form_mou").loading();
      var id = $("#id").val();
      var nomor = $("#nomor").val();
      var tgl = $("#tgl").val();
      var nama_perusahaan = $("#nama_perusahaan").val();
      var nama_pihak1 = $("#nama_pihak1").val();
      var nik_pihak1 = $("#nik_pihak1").val();
      var jabatan_pihak1 = $("#jabatan_pihak1").val();
      var jabatan_ttd_pihak1 = $("#jabatan_ttd_pihak1").val();
      var alamat_pihak1 = $("#alamat_pihak1").val();
      var nama_pihak2 = $("#nama_pihak2").val();
      var nik_pihak2 = $("#nik_pihak2").val();
      var jabatan_pihak2 = $("#jabatan_pihak2").val();
      var jabatan_ttd_pihak2 = $("#jabatan_ttd_pihak2").val();
      var alamat_pihak2 = $("#alamat_pihak2").val();
      var penjualan_paling_cepat = $("#penjualan_paling_cepat").val();
      var penjualan_paling_lambat = $("#penjualan_paling_lambat").val();
      $.ajax({
        type:'post',
        url:'/ajax/mou_simpan.html',
        data:{
          id:id,
          nomor:nomor,
          tgl:tgl,
          nama_perusahaan:nama_perusahaan,
          nama_pihak1:nama_pihak1,
          nik_pihak1:nik_pihak1,
          jabatan_pihak1:jabatan_pihak1,
          jabatan_ttd_pihak1:jabatan_ttd_pihak1,
          alamat_pihak1:alamat_pihak1,
          nama_pihak2:nama_pihak2,
          nik_pihak2:nik_pihak2,
          jabatan_pihak2:jabatan_pihak2,
          jabatan_ttd_pihak2:jabatan_ttd_pihak2,
          alamat_pihak2:alamat_pihak2,
          penjualan_paling_cepat:penjualan_paling_cepat,
          penjualan_paling_lambat:penjualan_paling_lambat
        },
        success:function(resp){
          $("#form_mou").loading("stop");
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

          }
        },error:function(){
          $("#form_mou").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  $("#form_file").validate({
    submitHandler:function(){
      tambah_data_file();
      return false;
    }
  });
});
function tambah_data_file(){
  $("#form_file").loading();
  var id = $("#id").val();
  var nama = $("#nama_file").val();
  var data = new FormData();
  data.append("id",id);
  data.append("nama",nama);
  if($('#file_file')[0].files.length > 0){
    data.append('file', $('#file_file')[0].files[0]);
    $.ajax({
      type:'post',
      url:'/ajax/file_tambah.html',
      cache: false,
      contentType: false,
      processData: false,
      data:data,
      success:function(resp){
        $("#form_file").loading("stop");
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
          page_file = 1;
          load_data_file();
        }
      },error:function(){
        $("#form_file").loading("stop");
        toastr["error"]("Silahkan periksa koneksi internet anda");
      }
    });
  }else{
    $("#form_file").loading("stop");
    toastr["error"]("File belum dipilih");
  }
}
function tambah(){
  $("#form_data").loading();
  var nama = $("#nama").val();
  var user = $("#user").val();
  var level = $("#level").val();
  var status = $("#status").val();
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
  data.append("status",status);
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
  var status = $("#status").val();
  var data = new FormData();
  data.append("id",id);
  data.append("nama",nama);
  data.append("user",user);
  data.append("level",level);
  data.append("status",status);
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
  $("#div_status").show();
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
  var status = $(itu).attr("data-status");
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
  $("#div_status").show();
  $("#id").val(id);
  $("#nama").val(nama);
  $("#user").val(user);
  $("#level").val(level);
  $("#status").val(status);
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
function modal_mou(itu){
  $("#form_mou").trigger("reset");
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  $("#modal_title_mou").html("MoU " + nama);
  $("#modal_mou").modal("show");
  $("#id").val(id);
  get_mou_data(id);
}
function modal_file(itu){
  $("#form_file").trigger("reset");
  $("#form_file").find(".custom-file-label").html("Pilih File");
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  $("#modal_file_title").html("File <b>" + nama + "</b>");
  $("#id").val(id);
  $("#modal_file").modal("show");
  page_file = 1;
  load_data_file();
}
function generate_pdf(){
  $("#form_mou").loading();
  var id = $("#id").val();
  $.ajax({
    type:'post',
    url:'/ajax/mou_generate_pdf.html',
    data:{id:id},
    success:function(resp){
      $("#form_mou").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"]("Silahkan lengkapi data MoU");
        }
      }else{
        var data = res.output;
        window.open(data,"_blank");
      }
    },error:function(){
      $("#form_mou").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function get_mou_data(id){
  $("#form_mou").loading();
  $.ajax({
    type:'post',
    url:'/ajax/mou.html',
    data:{id:id},
    success:function(resp){
      $("#form_mou").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        var data = res.data[0];
        $("#nomor").val(data['nomor']);
        $("#tgl").val(data['tgl']);
        $("#nama_perusahaan").val(data['nama_perusahaan']);
        $("#nama_pihak1").val(data['nama_pihak1']);
        $("#nik_pihak1").val(data['nik_pihak1']);
        $("#jabatan_pihak1").val(data['jabatan_pihak1']);
        $("#jabatan_ttd_pihak1").val(data['jabatan_ttd_pihak1']);
        $("#alamat_pihak1").val(data['alamat_pihak1']);
        $("#nama_pihak2").val(data['nama_pihak2']);
        $("#nik_pihak2").val(data['nik_pihak2']);
        $("#jabatan_pihak2").val(data['jabatan_pihak2']);
        $("#jabatan_ttd_pihak2").val(data['jabatan_ttd_pihak2']);
        $("#alamat_pihak2").val(data['alamat_pihak2']);
        $("#penjualan_paling_cepat").val(data['penjualan_paling_cepat']);
        $("#penjualan_paling_lambat").val(data['penjualan_paling_lambat']);
      }
    },error:function(){
      $("#form_mou").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
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
  $("#div_status").hide();
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
            var status = "";
            if(v['status'] == "1"){
              status = "<span class='badge badge-success'>Aktif</span>";
            }else{
              status = "<span class='badge badge-dark'>Tidak Aktif</span>";
            }
            html += "<tr>";
            html += "<td>" + no + "</td>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['user'] + "</td>";
            html += "<td>" + level + "</td>";
            html += "<td>" + status + "</td>";
            html += "<td>";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' onclick='modal_password(this);' class='btn btn-primary'><span class='fa fa-key'></span></a> ";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-status='" + v['status'] + "' data-nama='" + v['nama'] + "' data-file-npwp='" + v['file_npwp'] + "' data-file-ktp='" + v['file_ktp'] + "' data-nik='" + v['nik'] + "' data-email='" + v['email'] + "' data-alamat='" + v['alamat'] + "' data-user='" + v['user'] + "' data-level='" + v['level'] + "' data-parent-user-id='" + v['parent_user_id'] + "' onclick='modal_edit(this);' class='btn btn-light'><span class='fa fa-edit'></span></a> ";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' onclick='hapus(this);' class='btn btn-danger'><span class='fa fa-trash'></span></a> ";
            if(v['level'] == "1" || v['level'] == "2"){
              html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' onclick='modal_mou(this);' class='btn btn-light'><span class='fa fa-handshake-o'></span></a> ";
              html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-nama='" + v['nama'] + "' onclick='modal_file(this);' class='btn btn-light'><span class='fa fa-file-o'></span></a> ";
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
function load_data_file(){
  var user_id = $("#id").val();
  $("#pagination_file").html("");
  $("#listdata_file").loading();
  var keyword = $("#keyword_file").val();
  $.ajax({
    type:'post',
    url:'/ajax/file_data.html',
    data:{user_id:user_id,keyword:keyword,page:page_file},
    success:function(resp){
      $("#listdata_file").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata_file").html("<tr><td colspan='4'>" + res.msg + "</td></tr>");
        }
      }else{
        var html = "";
        var no = page_file * 10 - 10;
        $.each(res.data,function(k,v){
          if(k < 10){
            no++;
            html += "<tr>";
            html += "<td>" + no + "</td>";
            html += "<td><form onsubmit='edit_file(this);return false;' data-id='" + v['id'] + "'><div class='input-group input-group-sm nama_input'><input type='text' class='form-control' value='" + v['nama'] + "' placeholder='Nama File'><div class='input-group-append'><button class='btn btn-primary' type='submit'><span class='fa fa-save'></span></button></div></div></form></td>";
            html += "<td><a href='" + v['file'] + "' target='_blank'>Lihat File</a></td>";
            html += "<td>";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' onclick='hapus_file(this);' class='btn btn-danger'><span class='fa fa-trash'></span></a> ";
            html += "</td>";
            html += "</tr>";
          }
        });
        $("#listdata_file").html(html);
        html_pagination_file(res.data.length);
      }
    },error:function(){
      $("#listdata_file").loading("stop");
      $("#listdata_file").html("<tr><td colspan='4'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}
function edit_file(itu){
  $(itu).loading();
  var id = $(itu).attr("data-id");
  var nama = $(itu).find("input").val();
  $.ajax({
    type:'post',
    url:'/ajax/file_edit.html',
    data:{id:id,nama:nama},
    success:function(resp){
      $(itu).loading("stop");
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
      $(itu).loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function hapus_file(itu){
  $.confirm({
    title: 'Konfirmasi',
    content: 'Apa anda yakin menghapus data file tersebut ?',
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
            $(itu).parent().loading();
            var id = $(itu).attr("data-id");
            $.ajax({
              type:'post',
              url:'/ajax/file_hapus.html',
              data:{id:id},
              success:function(resp){
                $(itu).parent().loading("stop");
                var res = JSON.parse(resp);
                var html = "";
                if(res.is_error){
                  if(res.must_login){
                    window.location = "/login.html";
                  }else{
                    toastr["error"](res.msg);
                  }
                }else{
                  page_file = 1;
                  load_data_file();
                }
              },error:function(){
                $(itu).parent().loading("stop");
                toastr["error"]("Silahkan periksa koneksi internet anda");
              }
            });
          }
        }
    }
  });

}
function html_pagination_file(jmldata){
  var html_pagination = "";
  html_pagination += "<div class='d-inline-block'>";
  html_pagination += "  <ul class='pagination'>";

  if(page_file == 1){
    //Isprev false
    html_pagination += "    <li class='page-item disabled'>";
    html_pagination += "      <a class='page-link text-secondary' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-secondary'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }else{
    //Isprev true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body prevpage_file' data-page='" + (parseInt(page_file) - 1) + "' href='javascript:void(0);'>";
    html_pagination += "        <span class='fa fa-chevron-left text-body'>&nbsp;</span> Sebelumnya";
    html_pagination += "      </a>";
    html_pagination += "    </li>";
  }
  html_pagination += "    <li class='page-item disabled'><a class='page-link text-body' href='javascript:void(0);'>" + page_file + "</a></li>";
  if(jmldata > 10){
    //Isnext true
    html_pagination += "    <li class='page-item'>";
    html_pagination += "      <a class='page-link text-body nextpage_file' data-page='" + (parseInt(page_file) + 1) + "' href='javascript:void(0);'>";
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
  $("#pagination_file").html(html_pagination);
  trigger_pagination_file();
}
function trigger_pagination_file(){
  $(".prevpage_file").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page_file = get_page;
    load_data_file();
  });
  $(".nextpage_file").click(function(e){
    e.preventDefault();
    var get_page  = $(this).attr("data-page");
    page_file = get_page;
    load_data_file();
  });
}
