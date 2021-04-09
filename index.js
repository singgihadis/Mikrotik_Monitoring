const path = require('path');
const express = require('express');
const session = require('express-session');
// let RedisStore = require('connect-redis')(session);
const hbs = require('hbs');
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
app.use("/firebase-messaging-sw.js", express.static(__dirname + '/firebase-messaging-sw.js'));
app.use(session({
    // store: new RedisStore({ client: redisClient }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 86400000 }
}));
require('./routes/routes')(app);
require('./routes/ajax_login')(app);
require('./routes/ajax_dashboard')(app);
require('./routes/ajax_monitoring')(app);
require('./routes/ajax_ping')(app);
require('./routes/ajax_umum')(app);

//server listening
var server = app.listen(3002, () => {
  var public_function = require("./function/public_function.js");
  public_function.Ping();
  console.log('Server is running at port 3002');
});
