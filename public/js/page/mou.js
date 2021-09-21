$(document).ready(function(){
  $("#form_data").validate({
    submitHandler:function(){
      $("#form_data").loading();
      var nama_pihak2 = $("#nama_pihak2").val();
      var nik_pihak2 = $("#nik_pihak2").val();
      var jabatan_pihak2 = $("#jabatan_pihak2").val();
      var jabatan_ttd_pihak2 = $("#jabatan_ttd_pihak2").val();
      var alamat_pihak2 = $("#alamat_pihak2").val();
      $.ajax({
        type:'post',
        url:'/ajax/mou_simpan.html',
        data:{
          nama_pihak2:nama_pihak2,
          nik_pihak2:nik_pihak2,
          jabatan_pihak2:jabatan_pihak2,
          jabatan_ttd_pihak2:jabatan_ttd_pihak2,
          alamat_pihak2:alamat_pihak2
        },
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
            toastr["success"]("Berhasil simpan data");

          }
        },error:function(){
          $("#form_data").loading("stop");
          toastr["error"]("Silahkan periksa koneksi internet anda");
        }
      });
    }
  });
  get_data();
  render_pdf();
});
function render_pdf(){

}
function get_data(){
  $("#form_data").loading();
  $.ajax({
    type:'post',
    url:'/ajax/mou.html',
    data:{},
    success:function(resp){
      $("#form_data").loading("stop");
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
        $("#nik_pihak1").val(data['nama_pihak1']);
        $("#jabatan_pihak1").val(data['nama_pihak1']);
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
      $("#form_data").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
function generate_pdf(){
  $("#form_data").loading();
  $.ajax({
    type:'post',
    url:'/ajax/mou_generate_pdf.html',
    data:{},
    success:function(resp){
      $("#form_data").loading("stop");
      var res = JSON.parse(resp);
      var html = "";
      if(res.is_error){
        if(res.must_login){
          window.location = "/login.html";
        }else{
          toastr["error"]("Silahkan kontak admin untuk mengecek kelengkapan data MoU anda");
        }
      }else{
        var data = res.output;
        window.open(data,"_blank");
      }
    },error:function(){
      $("#form_data").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
