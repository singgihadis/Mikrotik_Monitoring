module.exports = function(app){
  app.get(['/','/login.html'],(req, res) => {
    if(req.session.is_login){
      res.redirect("/traffic.html");
    }else{
      res.render("login",{
        title:"Login"
      });
    }
  });
  app.get(['/traffic.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var master_kota_id = req.session.master_kota_id;
      res.render("dashboard",{
        title:"Traffic",
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
      res.render("monitoring",{
        title:"Host",
        menu:"monitoring",
        sub_menu:"host"
      });
    }
  });
  app.get(['/ping.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("ping",{
        title:"Ping",
        menu:"monitoring",
        sub_menu:"ping"
      });
    }
  });
  app.get(['/dns.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("dns",{
        title:"DNS",
        menu:"monitoring",
        sub_menu:"dns"
      });
    }
  });
  app.get(['/hotspot.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("hotspot",{
        title:"Hotspot",
        menu:"user_manager",
        sub_menu:"hotspot"
      });
    }
  });
  app.get(['/ppp.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("ppp",{
        title:"PPP",
        menu:"user_manager",
        sub_menu:"ppp"
      });
    }
  });
  app.get(['/member.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("member",{
        title:"member",
        menu:"user_manager",
        sub_menu:"member"
      });
    }
  });
  app.get(['/pembayaran.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("pembayaran",{
        title:"pembayaran",
        menu:"user_manager",
        sub_menu:"pembayaran"
      });
    }
  });
  app.get(['/pembayaran/bayar.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("bayar",{
        title:"Bayar",
        menu:"user_manager",
        sub_menu:"pembayaran"
      });
    }
  });
  app.get(['/logout.html'],(req, res) => {
    req.session.destroy(function(err) {
      res.redirect("/login.html");
    });
  });
}
