module.exports = {
  FormatAngka : function(str){
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
  }
}
