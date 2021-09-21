module.exports = {
  FormatAngka : function(str){
    if(str == null || str == undefined){
      str = "0";
    }
    str = str.toString().replace(/\D/g,'');
    if(str != ""){
      str = parseInt(str);
    }
    return str.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
  },
  NamaBulan : function(x){
    if(x == "1"){
      return "Januari";
    }else if(x == "2"){
      return "Februari";
    }else if(x == "3"){
      return "Maret";
    }else if(x == "4"){
      return "April";
    }else if(x == "5"){
      return "Mei";
    }else if(x == "6"){
      return "Juni";
    }else if(x == "7"){
      return "Juli";
    }else if(x == "8"){
      return "Agustus";
    }else if(x == "9"){
      return "September";
    }else if(x == "10"){
      return "Oktober";
    }else if(x == "11"){
      return "November";
    }else if(x == "12"){
      return "Desember";
    }
  },
  NamaHari : function(x){
    if(x == "1"){
      return "Senin";
    }else if(x == "2"){
      return "Selasa";
    }else if(x == "3"){
      return "Rabu";
    }else if(x == "4"){
      return "Kamis";
    }else if(x == "5"){
      return "Jumat";
    }else if(x == "6"){
      return "Sabtu";
    }else if(x == "7"){
      return "Minggu";
    }
  },
  TahunAngkaToText : function(tahun){
    var hasil = "";
    var tahun_arr = tahun.split("");
    hasil += module.exports.AngkaToText(tahun_arr[0]);
    if(tahun_arr[1] == "0"){
      hasil += " ribu";
    }else if(tahun_arr[1] == "1"){
      hasil += " ribu seratus";
    }else{
      hasil += " ribu " + module.exports.AngkaToText(tahun_arr[1]) + " ratus";
    }
    var angka_akhir = parseInt(tahun_arr[2].toString() + tahun_arr[3].toString());
    if(angka_akhir > 19){
      hasil += " " + module.exports.AngkaToText(tahun_arr[2]) + " puluh";
      hasil += " " + module.exports.AngkaToText(tahun_arr[3]);
    }else{
      hasil += " " + module.exports.AngkaToText(angka_akhir);
    }
    hasil = module.exports.TitleCase(hasil);
    return hasil;
  },
  AngkaToText : function(angka){
    var hasil = "";
    if(angka == "1"){
      return "satu";
    }else if(angka == "2"){
      return "dua";
    }else if(angka == "3"){
      return "tiga";
    }else if(angka == "4"){
      return "empat";
    }else if(angka == "5"){
      return "lima";
    }else if(angka == "6"){
      return "enam";
    }else if(angka == "7"){
        return "tujuh";
    }else if(angka == "8"){
      return "delapan";
    }else if(angka == "9"){
      return "sembilan";
    }else if(angka == "10"){
      return "sepuluh";
    }else if(angka == "11"){
      return "sebelas";
    }else if(angka == "12"){
      return "dua belas";
    }else if(angka == "13"){
      return "tiga belas";
    }else if(angka == "14"){
      return "empat belas";
    }else if(angka == "15"){
      return "lima belas";
    }else if(angka == "16"){
      return "enam belas";
    }else if(angka == "17"){
      return "tujuh belas";
    }else if(angka == "18"){
      return "delapan belas";
    }else if(angka == "19"){
      return "sembilan belas";
    }
  },
  TitleCase : function(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }
}
