var page = 1;
var is_edit = false;
$(document).ready(function(){
  $("#harga").keyup(function(){
    $("#harga").val(FormatAngka($(this).val()));
  });
  $("#form_data").validate({
    submitHandler:function(){
      if(is_edit){
        edit();
      }else{
        tambah();
      }
      return false;
    },
    errorPlacement: function(error, element) {
      if(element.attr("name") == "kapasitas") {
        error.appendTo(element.parent().parent());
      } else {
        error.insertAfter(element);
      }
    }
  });
  $("#form_search").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  load_data();
  $("#harga").keyup(function(){
    trigger_nominal_pembayaran_total();
  });
});
function trigger_nominal_pembayaran_total(){
  var harga_paket = StrToNumber($("#harga").val());
  var ppn = parseInt((10 / 100) * harga_paket);
  var nominal_pembayaran_total = harga_paket + ppn;
  $("#ppn").val(FormatAngka(ppn));
  $("#nominal_pembayaran").val(FormatAngka(nominal_pembayaran_total));
}
function modal_tambah(){
  is_edit = false;
  $("#form_data").trigger("reset");
  $("#modal_form_title").html("Tambah Paket");
  $("#modal_form").modal("show");
}
function edit(){
  $("#form_data").loading();
  var id = $("#id").val();
  var nama = $("#nama").val();
  var kapasitas = $("#kapasitas").val();
  var harga = StrToNumber($("#harga").val());
  $.ajax({
    type:'post',
    url:'/ajax/master_paket_edit.html',
    data:{id:id,nama:nama,kapasitas:kapasitas,harga:harga},
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
              url:'/ajax/master_paket_hapus.html',
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
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/master_paket_data.html',
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
            html += "<tr>";
            html += "<td>" + no + "</td>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['kapasitas'] + " Kbps</td>";
            html += "<td>Rp. " + FormatAngka(v['harga']) + "</td>";
            html += "<td>";
            html += "<a href='javascript:void(0);' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-kapasitas='" + v['kapasitas'] + "' data-harga='" + v['harga'] + "' onclick='modal_edit(this);' class='btn btn-light'><span class='fa fa-edit'></span></a> ";
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
function tambah(){
  $("#form_data").loading();
  var nama = $("#nama").val();
  var kapasitas = $("#kapasitas").val();
  var harga = StrToNumber($("#harga").val());
  $.ajax({
    type:'post',
    url:'/ajax/master_paket_tambah.html',
    data:{nama:nama,kapasitas:kapasitas,harga:harga},
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
function modal_edit(itu){
  $("#form_data").trigger("reset");
  is_edit = true;
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  var kapasitas = $(itu).attr("data-kapasitas");
  var harga = $(itu).attr("data-harga");
  $("#modal_form_title").html("Edit Paket");
  $("#id").val(id);
  $("#nama").val(nama);
  $("#kapasitas").val(kapasitas);
  $("#harga").val(FormatAngka(harga));
  $("#modal_form").modal("show");
  trigger_nominal_pembayaran_total();
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
