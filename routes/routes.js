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
  app.get(['/logout.html'],(req, res) => {
    req.session.destroy(function(err) {
      res.redirect("/login.html");
    });
  });
}
