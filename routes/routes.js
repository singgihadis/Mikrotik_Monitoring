module.exports = function(app){
  app.get(['/','/login.html'],(req, res) => {
    if(req.session.is_login){
      res.redirect("/dashboard.html");
    }else{
      res.render("login",{
        title:"Login"
      });
    }
  });
  app.get(['/dashboard.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      var master_kota_id = req.session.master_kota_id;
      res.render("dashboard",{
        title:"Dashboard",
        menu:"dashboard",
        master_kota_id:master_kota_id
      });
    }
  });
  app.get(['/monitoring.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("monitoring",{
        title:"Monitoring",
        menu:"monitoring"
      });
    }
  });
  app.get(['/ping.html'],(req, res) => {
    if(!req.session.is_login){
      res.redirect("/login.html");
    }else{
      res.render("ping",{
        title:"Ping",
        menu:"ping"
      });
    }
  });
  app.get(['/logout.html'],(req, res) => {
    req.session.destroy(function(err) {
      res.redirect("/login.html");
    });
  });
}
