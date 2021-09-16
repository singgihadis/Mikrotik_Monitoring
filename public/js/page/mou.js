$(document).ready(function(){
  $("#form_data").validate({
    submitHandler:function(){
      $("#form_data").loading();
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
        generate_pdf();
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

        }
      }else{
        var data = res.output;
      }
    },error:function(){
      $("#form_data").loading("stop");
      toastr["error"]("Silahkan periksa koneksi internet anda");
    }
  });
}
