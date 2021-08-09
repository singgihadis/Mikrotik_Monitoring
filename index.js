const path = require('path');
const express = require('express');
const session = require('express-session');
// let RedisStore = require('connect-redis')(session);
const hbs = require('hbs');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
hbs.registerPartials(__dirname + '/views');
hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ifNotEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('eq', function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(function (expression) {
        return args[0] === expression;
    });
});

// let redisClient = redis.createClient();



//set views file
app.set('views',path.join(__dirname,'views'));
//set view engine
app.set('view engine', 'hbs');
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "5mb" }));
//set folder public sebagai static folder untuk static file
app.use('/assets',express.static(__dirname + '/public'));
app.use('/assets',express.static(__dirname + '/public'));
app.use(session({
    // store: new RedisStore({ client: redisClient }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }
}));
app.use(function(req,res,next) {
  if(req.session.is_login){
    var pengaturan_function = require("./function/pengaturan_function.js");
    pengaturan_function.GetData(req.session.user_id,function(data){
      if(data == null){
        req.website_config = {
          title : "",
          favicon : "",
          logo : ""
        };
      }else{
        if(data[0]['master_kota_id'] != null){
          req.session.master_kota_id = data[0]['master_kota_id'];
        }
        var title = "";
        var favicon = "";
        var logo = "";
        if(data[0]['title'] != null){
          title = data[0]['title'];
        }
        if(data[0]['favicon'] != null){
          favicon = data[0]['favicon'];
        }
        if(data[0]['logo'] != null){
          logo = data[0]['logo'];
        }
        req.website_config = {
          title : title,
          favicon : favicon,
          logo : logo
        };
      }
      next();
    });
  }else{
    next();
  }
});
require('./routes/routes')(app);
require('./routes/ajax_login')(app);
require('./routes/ajax_traffic')(app);
require('./routes/ajax_monitoring')(app);
require('./routes/ajax_ping')(app);
require('./routes/ajax_dns')(app);
require('./routes/ajax_ppp')(app);
require('./routes/ajax_hotspot')(app);
require('./routes/ajax_dashboard')(app);
require('./routes/ajax_member')(app);
require('./routes/ajax_pembayaran')(app);
require('./routes/ajax_pengaturan')(app);
require('./routes/ajax_router')(app);
require('./routes/ajax_user')(app);
require('./routes/ajax_umum')(app);

//server listening
var server = app.listen(3002, () => {
  var ping_function = require("./function/ping_function.js");
  ping_function.Ping();
  var member_function = require("./function/member_function.js");
  member_function.Traffic();
  console.log('Server is running at port 3002');
});
