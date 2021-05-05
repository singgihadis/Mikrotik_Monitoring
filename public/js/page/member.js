var page = 1;
$(document).ready(function(){
  $("#form_data").validate({
    submitHandler:function(){
      page = 1;
      load_data();
    }
  });
  total_member();
  load_data();
  $("#form_member").validate({
    submitHandler:function(){
      $("#form_member").loading();
      var id = $("#id").val();
      var nama = $("#nama").val();
      var alamat = $("#alamat").val();
      var no_wa = $("#no_wa").val();
      var nominal_pembayaran = $("#nominal_pembayaran").val();
      $.ajax({
        type:'post',
        url:'/ajax/member_simpan.html',
        data:{id:id,nama:nama,alamat:alamat,no_wa:no_wa,nominal_pembayaran:nominal_pembayaran},
        success:function(resp){
          $("#form_member").loading("stop");
          var res = JSON.parse(resp);
          var html = "";
          if(res.is_error){
            if(res.must_login){
              window.location = "/login.html";
            }else{
              toastr["error"](res.msg);
            }
          }else{
            $("#modal_update").modal("hide");
            toastr["success"]("Berhasil menambahkan");
            load_data();
          }
        },error:function(){
          $("#form_member").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
});
function load_data(){
  $("#pagination").html("");
  $("#listdata").loading();
  var keyword = $("#keyword").val();
  $.ajax({
    type:'post',
    url:'/ajax/member.html',
    data:{keyword:keyword,page:page},
    success:function(resp){
      $("#listdata").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          $("#listdata").html("<tr><td colspan='9'>" + res.msg + "</td></tr>");
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
            html += "<td>" + v['nama_server'] + "</td>";
            html += "<td>" + v['name'] + "</td>";
            html += "<td>" + v['profile'] + "</td>";
            html += "<td>" + v['nama'] + "</td>";
            html += "<td>" + v['alamat'] + "</td>";
            html += "<td>" + v['no_wa'] + "</td>";
            html += "<td>Rp. " + FormatAngka(v['nominal_pembayaran']) + "</td>";
            html += "<td class='text-center'>";
            html += "<a onclick='modal_update(this)' data-id='" + v['id'] + "' data-nama='" + v['nama'] + "' data-alamat='" + v['alamat'] + "' data-no-wa='" + v['no_wa'] + "' data-nominal-pembayaran='" + v['nominal_pembayaran'] + "' href='javascript:void(0);' class='btn btn-light'><span class='fa fa-edit'></span></a>";
            html += " <a href='/member/traffic/" + v['id'] + "/" + v['server_id'] + ".html' class='btn btn-primary'><span class='fa fa-area-chart'></span></a>";
            html += "</td>";
            html += "</tr>";
            no++;
          }
        });
        $("#listdata").html(html);
        html_pagination(res.data.length);
        $("#info_page").html(first + " - " + (no - 1) + " dari " + FormatAngka(res.total));
      }
    },error:function(){
      $("#listdata").loading("stop");
      $("#info_page").html("0 - 0 dari 0");
      $("#listdata").html("<tr><td colspan='9'>Silahkan periksa koneksi internet anda</td></tr>");
    }
  });
}

function total_member(){
  $.ajax({
    type:'post',
    url:'/ajax/total_member.html',
    data:{},
    success:function(resp){
      var res = JSON.parse(resp);
      var html = "";
      var total = 0;
      var total_belum_update = 0;
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{

        }
      }else{
        total = res['total'];
        total_belum_update = res['total_belum_update'];
      }
      $("#total").html(FormatAngka(total));
      $("#total_belum_update").html(FormatAngka(total_belum_update));
    },error:function(){

    }
  });
}
function modal_update(itu){
  var id = $(itu).attr("data-id");
  var nama = $(itu).attr("data-nama");
  var alamat = $(itu).attr("data-alamat");
  var no_wa = $(itu).attr("data-no-wa");
  var nominal_pembayaran = $(itu).attr("data-nominal-pembayaran");
  $("#id").val(id);
  $("#nama").val(nama);
  $("#alamat").val(alamat);
  $("#no_wa").val(no_wa);
  $("#nominal_pembayaran").val(nominal_pembayaran);
  $("#modal_update").modal("show");
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
