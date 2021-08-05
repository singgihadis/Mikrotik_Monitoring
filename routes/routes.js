const pool = require('../db');
const fs = require('fs');
var moment = require("moment");
var public_function = require("../function/public_function.js");
module.exports = function(app){
  app.get(['/','/login.html'],(req, res) => {
    if(req.session.is_login){
      res.redirect("/router.html");
    }else{
      var website_config = req.website_config;
      res.render("login");
    }
  });
  app.get(['/traffic.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
        var website_config = req.website_config;
        var master_kota_id = req.session.master_kota_id;
        var level = req.session.level;
        var title = "";
        if(website_config['title'] != ""){
          title = "Traffic - " + website_config['title'];
        }else{
          title = "Traffic";
        }
        res.render("traffic",{
          title:title,
          favicon:website_config['favicon'],
          logo:website_config['logo'],
          menu:"monitoring",
          sub_menu:"traffic",
          master_kota_id:master_kota_id,
          server_id:server_id,
          level:level,
          with_server:1
        });
      }else{
        window.location = "/router.html"
      }
    }
  });
  app.get(['/host.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
        var website_config = req.website_config;
        var level = req.session.level;
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
          sub_menu:"host",
          server_id:server_id,
          level:level,
          with_server:1
        });
      }else{
        window.location = "/router.html"
      }

    }
  });
  app.get(['/ping.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
        var website_config = req.website_config;
        var level = req.session.level;
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
          sub_menu:"ping",
          server_id:server_id,
          level:level,
          with_server:1
        });
      }else{
        window.location = "/router.html"
      }

    }
  });
  app.get(['/dns.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
        var website_config = req.website_config;
        var level = req.session.level;
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
          sub_menu:"dns",
          server_id:server_id,
          level:level,
          with_server:1
        });
      }else{
        window.location = "/router.html"
      }

    }
  });
  app.get(['/dns/export.txt'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      if(req.session.server_id){
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
      }else{
        res.redirect("/router.html");
      }
    }
  });
  app.get(['/hotspot.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
        var website_config = req.website_config;
        var level = req.session.level;
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
          sub_menu:"hotspot",
          server_id:server_id,
          level:level,
          with_server:1
        });
      }else{
        window.location = "/router.html"
      }

    }
  });
  app.get(['/ppp.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
        var website_config = req.website_config;
        var level = req.session.level;
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
          sub_menu:"ppp",
          server_id:server_id,
          level:level,
          with_server:1
        });
      }else{
        window.location = "/router.html"
      }

    }
  });
  app.get(['/member.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var level = req.session.level;
      var title = "";
      if(website_config['title'] != ""){
        title = "Member - " + website_config['title'];
      }else{
        title = "Member";
      }
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      res.render("member",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"member",
        level:level,
        server_id:server_id,
        with_server:0
      });
    }
  });
  app.get(['/member/traffic/:id/:server_id.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id_unselected = req.params.server_id;
      var website_config = req.website_config;
      var id = req.params.id;
      var level = req.session.level;
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
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
        menu:"member",
        id:id,
        server_id_unselected:server_id_unselected,
        level:level,
        server_id:server_id,
        with_server:0
      });
    }
  });
  app.get(['/pembayaran.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      var website_config = req.website_config;
      var level = req.session.level;
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
        menu:"pembayaran",
        server_id:server_id,
        level:level,
        with_server:0
      });
    }
  });
  app.get(['/pembayaran/bayar.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      var website_config = req.website_config;
      var level = req.session.level;
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
        menu:"pembayaran",
        server_id:server_id,
        level:level,
        with_server:0
      });
    }
  });
  app.get(['/pengaturan.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      var website_config = req.website_config;
      var level = req.session.level;
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
        menu:"pengaturan",
        server_id:server_id,
        level:level,
        with_server:0
      });
    }
  });
  app.get(['/router.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      var website_config = req.website_config;
      var level = req.session.level;
      var title = "";
      if(website_config['title'] != ""){
        title = "Router - " + website_config['title'];
      }else{
        title = "Router";
      }
      res.render("router",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"router",
        server_id:server_id,
        level:level,
        with_server:0,
        user_id:req.session.user_id
      });
    }
  });
  app.get(['/user.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      var website_config = req.website_config;
      var level = req.session.level;
      var title = "";
      if(website_config['title'] != ""){
        title = "User - " + website_config['title'];
      }else{
        title = "User";
      }
      res.render("user",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"user",
        server_id:server_id,
        level:level,
        with_server:0
      });
    }
  });
  app.get(['/dashboard.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var website_config = req.website_config;
      var level = req.session.level;
      var title = "";
      if(website_config['title'] != ""){
        title = "Dashboard - " + website_config['title'];
      }else{
        title = "Dashboard";
      }
      var server_id = "";
      if(req.session.server_id){
        server_id = req.session.server_id;
      }
      res.render("dashboard",{
        title:title,
        favicon:website_config['favicon'],
        logo:website_config['logo'],
        menu:"dashboard",
        level:level,
        server_id:server_id,
        with_server:0
      });
    }
  });
  app.get(['/logout.html'],(req, res) => {
    req.session.destroy(function(err) {
      res.redirect("/login.html");
    });
  });
}
