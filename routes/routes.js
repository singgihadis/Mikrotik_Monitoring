const pool = require('../db');
const fs = require('fs');
module.exports = function(app){
  app.get(['/','/login.html'],(req, res) => {
    if(req.session.is_login){
      res.redirect("/traffic.html");
    }else{
      var website_config = req.website_config;
      res.render("login");
    }
  });
  app.get(['/traffic.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var master_kota_id = req.session.master_kota_id;
      var title = "";
      if(website_config['title'] != ""){
        title = "Traffic - " + website_config['title'];
      }else{
        title = "Traffic";
      }
      res.render("dashboard",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"monitoring",
        sub_menu:"traffic",
        master_kota_id:master_kota_id
      });
    }
  });
  app.get(['/host.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Host - " + website_config['title'];
      }else{
        title = "Host";
      }
      res.render("monitoring",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"monitoring",
        sub_menu:"host"
      });
    }
  });
  app.get(['/ping.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Ping - " + website_config['title'];
      }else{
        title = "Ping";
      }
      res.render("ping",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"monitoring",
        sub_menu:"ping"
      });
    }
  });
  app.get(['/dns.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "DNS - " + website_config['title'];
      }else{
        title = "DNS";
      }
      res.render("dns",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"monitoring",
        sub_menu:"dns"
      });
    }
  });
  app.get(['/dns/export.txt'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var keyword = "";
      if(req.query.k != undefined){
        keyword = req.query.k;
      }
      pool.getConnection(function(err, connection) {
        var arr_query = [];
        if(keyword != ""){
          arr_query.push("concat(name,type,data) like '%" + keyword + "%'");
        }
        arr_query.push("server_id=" + req.session.server_id);
        var filter_query = "";
        if(arr_query.length > 0){
          filter_query = " where " + arr_query.join(" and ");
        }
        var sql_data = "select * from dns " + filter_query;
        var query_data = connection.query(sql_data, function (err, results, fields) {
          connection.release();
          var hasil = "/ip firewall address-list";
          if(results.length > 0){
            results.forEach((item, i) => {
              hasil += "\nadd list=" + keyword + " address=" + item['name']
            });
          }
          res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename=dns.txt'});
          res.end(hasil);
        });
      });

    }
  });
  app.get(['/hotspot.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Hotspot - " + website_config['title'];
      }else{
        title = "Hotspot";
      }
      res.render("hotspot",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user_manager",
        sub_menu:"hotspot"
      });
    }
  });
  app.get(['/ppp.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "PPP - " + website_config['title'];
      }else{
        title = "PPP";
      }
      res.render("ppp",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user_manager",
        sub_menu:"ppp"
      });
    }
  });
  app.get(['/member.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Member - " + website_config['title'];
      }else{
        title = "Member";
      }
      res.render("member",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user_manager",
        sub_menu:"member"
      });
    }
  });
  app.get(['/member/traffic/:id.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var id = req.params.id;
      var title = "";
      if(website_config['title'] != ""){
        title = "Member Traffic - " + website_config['title'];
      }else{
        title = "Member Traffic";
      }
      res.render("member_traffic",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user_manager",
        sub_menu:"member",
        id:id
      });
    }
  });
  app.get(['/pembayaran.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Pembayaran - " + website_config['title'];
      }else{
        title = "Pembayaran";
      }
      res.render("pembayaran",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user_manager",
        sub_menu:"pembayaran"
      });
    }
  });
  app.get(['/pembayaran/bayar.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Bayar - " + website_config['title'];
      }else{
        title = "Bayar";
      }
      res.render("bayar",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user_manager",
        sub_menu:"pembayaran"
      });
    }
  });
  app.get(['/pengaturan.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var title = "";
      if(website_config['title'] != ""){
        title = "Pengaturan - " + website_config['title'];
      }else{
        title = "Pengaturan";
      }
      res.render("pengaturan",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"pengaturan"
      });
    }
  });
  app.get(['/logout.html'],(req, res) => {
    req.session.destroy(function(err) {
      res.redirect("/login.html");
    });
  });
}
