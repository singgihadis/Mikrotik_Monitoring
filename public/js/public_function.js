jQuery.validator.addMethod('validIP', function(value) {
    var split = value.split('.');
    if (split.length != 4)
        return false;

    for (var i=0; i<split.length; i++) {
        var s = split[i];
        if (s.length==0 || isNaN(s) || s<0 || s>255)
            return false;
    }
    return true;
}, ' Invalid IP Address');

jQuery.extend(jQuery.validator.messages, {
    required: "Wajib diisi.",
    remote: "Please fix this field.",
    email: "Silahkan masukkan email yang valid.",
    url: "Please enter a valid URL.",
    date: "Please enter a valid date.",
    dateISO: "Please enter a valid date (ISO).",
    number: "Please enter a valid number.",
    digits: "Please enter only digits.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Silahkan masukkan isian yang sama.",
    accept: "Please enter a value with a valid extension.",
    maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
    minlength: jQuery.validator.format("Please enter at least {0} characters."),
    rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
    range: jQuery.validator.format("Please enter a value between {0} and {1}."),
    max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
    min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
});

function ByteToDigitalStorageUnit_Computer(x){
  var label = "B";
  var value = parseFloat(x);
  if(x >= 1024){
    label = "KiB";
    value = x / 1024;
    if(value >= 1024){
      label = "MiB";
      value = value / 1024;
      if(value >= 1024){
        label = "GiB";
        value = value / 1024;
        if(value >= 1024){
          label = "TiB";
          value = value / 1024;
          if(value >= 1024){
            label = "PiB";
            value = value / 1024;
          }
        }
      }
    }
  }
  return {label:label,value:value};
}
function ByteToDigitalStorageUnit(x){
  var label = "B";
  var value = parseFloat(x);
  if(x >= 1000){
    label = "KB";
    value = x / 1000;
    if(value >= 1000){
      label = "MB";
      value = value / 1000;
      if(value >= 1000){
        label = "GB";
        value = value / 1000;
        if(value >= 1000){
          label = "TB";
          value = value / 1000;
          if(value >= 1000){
            label = "PB";
            value = value / 1000;
          }
        }
      }
    }
  }
  return {label:label,value:value};
}
function BitToKibiByte(x){
  x = parseInt(x);
  var hasil = (x / 8) / 1024;
  return hasil;
}
function IsEmpty(isi){
  if(isi == 0 || isi == "" || isi == null){
    return true;
  }else{
    return false;
  }
}
$(document).ready(function(){
    $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
    });
});
function toTitleCase(str) {
    if(str == null){
      str = "";
    }
    str = str.toLowerCase();
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}
function FormatAngka(str){
  str = str.toString().replace(/\D/g,'');
  if(str != ""){
    str = parseInt(str);
  }
  return str.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
}
function StrToNumber(str){
  str = str.replace("Rp. ","").replace(/\./g,"");
  return parseInt(str);
}
function URLSeo(Text){
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}
function DistanceFromLatLon(lat1,lon1,lat2,lon2){
  var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    // var e = parseInt((d * 1000).toFixed(0));
    return d;
}
function deg2rad(deg){
    return deg * (Math.PI/180)
}
function IndexToMonth(x){
  var bulan = "";
  if(x == 0){
    bulan = "Januari";
  }else if(x == 1){
    bulan = "Februari";
  }else if(x == 2){
    bulan = "Maret";
  }else if(x == 3){
    bulan = "April";
  }else if(x == 4){
    bulan = "Mei";
  }else if(x == 5){
    bulan = "Juni";
  }else if(x == 6){
    bulan = "Juli";
  }else if(x == 7){
    bulan = "Agustus";
  }else if(x == 8){
    bulan = "September";
  }else if(x == 9){
    bulan = "Oktober";
  }else if(x == 10){
    bulan = "November";
  }else if(x == 11){
    bulan = "Desember";
  }
  return bulan;
}
function TwoDigitNumber(x){
  if(x == ""){
    return "00";
  }else{
    if(x.toString().length == 1){
      return "0" + x;
    }else{
      return x;
    }
  }
}
function UptimeFix(inputan){
  if(!IsEmpty(inputan)){
    var get_week = [0,inputan];
    if(inputan.indexOf("w") != -1){
      get_week = inputan.split("w");
    }
    var week = get_week[0];
    var get_day = [0,get_week[1]];
    if(get_week[1].indexOf("d") != -1){
      get_day = get_week[1].split("d");
    }
    var day = get_day[0];
    var get_hour = [0,get_day[1]];
    if(get_day[1].indexOf("h") != -1){
      get_hour = get_day[1].split("h");
    }
    var hour = get_hour[0];
    var get_minute = [0,get_hour[1]];
    if(get_hour[1].indexOf("m") != -1){
      get_minute = get_hour[1].split("m");
    }
    var minute = get_minute[0];
    var get_second = [0,get_minute[1]];
    if(get_minute[1].indexOf("s") != -1){
      get_second = get_minute[1].split("s");
    }
    var second = get_second[0];
    var weekinday = parseInt(week) * 7;
    var day = parseInt(day) + weekinday;
    return day + "d " + TwoDigitNumber(hour) + ":" + TwoDigitNumber(minute) + ":" + TwoDigitNumber(second);
  }else{
    return "";
  }
}
function TitleCase(str){
  str = str.toLowerCase();
  return str.replace(/(?:^|\s)\w/g, function(match) {
      return match.toUpperCase();
  });
}
function ParseBMKGCuaca(x){
  var hasil = "";
  if(x == "0" || x == "100"){
    hasil = "Cerah";
  }else if(x == "1" || x == "101"){
    hasil = "Cerah Berawan";
  }else if(x == "2" || x == "102"){
    hasil = "Cerah Berawan";
  }else if(x == "3" || x == "103"){
    hasil = "Berawan";
  }else if(x == "4" || x == "104"){
    hasil = "Berawan Tebal";
  }else if(x == "5"){
    hasil = "Udara Kabur";
  }else if(x == "10"){
    hasil = "Asap";
  }else if(x == "45"){
    hasil = "Kabut";
  }else if(x == "60"){
    hasil = "Hujan Ringan";
  }else if(x == "61"){
    hasil = "Hujan Sedang";
  }else if(x == "63"){
    hasil = "Hujan Lebat";
  }else if(x == "80"){
    hasil = "Hujan Lokal";
  }else if(x == "95"){
    hasil = "Hujan Petir";
  }else if(x == "97"){
    hasil = "Hujan Petir";
  }
  return hasil;
}
