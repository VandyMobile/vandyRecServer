
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , engine = require('ejs-locals')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('./db')
  , data = require('./routes/data');

var app = express();


if (process.env.MONGOHQ_URL) {

  db.setURL(process.env.MONGOHQ_URL);
} else {
  db.setURL('mongodb://localhost:27017/recDB');
}
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.engine('ejs', engine); //add this code for setting up ejs
  app.use(express.favicon());
  app.use(express.cookieParser());
  //session middleware needs to be called after the cookie parder middleware
  app.use(express.session({ secret: 'secretSessionKey' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  
  app.use(express.errorHandler());
});


passport.use(new LocalStrategy( function(username, password, done) {
  db.login(username, password, function(isSuccessful, user) {
    if (isSuccessful) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
  /*
  if (username === user.username && password === user.password) {

      return done(null, user);
  }
  return done(null, false);
  */
}));

//routes
app.get('/', routes.index);

app.post('/', passport.authenticate('local', {failureRedirect: '/login?failed=true'}) , routes.index);

app.get('/login', routes.login);
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});
//client routing
app.get('/news', routes.news);
app.put('/news', routes.updateNews);
app.post('/news', routes.createNews);
app.delete('/news', routes.deleteNews);

app.get('/hours', routes.hours);
app.put('/hours', routes.updateHours);
app.post('/hours', routes.createHours);
app.delete('/hours', routes.deleteHours);

app.get('/groupFitness', routes.groupFitness);
app.put('/groupFitness', routes.updateGF);
app.post('/groupFitness', routes.createGF);
app.delete('/groupFitness', routes.deleteGF);


app.get('/traffic', routes.traffic);


app.get('/intramurals', routes.intramurals);
app.post('/intramurals', routes.createIntramurals);
app.put('/intramurals', routes.updateIntramurals);
app.delete('/intramurals', routes.deleteIntramurals);

app.post('/intramurals/files', routes.intramuralFiles);
app.get('/intramurals/details', routes.intramuralsDetails);
app.get('/intramurals/download', routes.downloadHTML);

app.get('/programs', routes.programs);

//JSON data for all the tabs
app.get('/JSON/news', data.news);
app.get('/JSON/hours', data.hours);
app.get('/JSON/GF', data.groupFitness);
app.get('/JSON/IM', data.intramurals);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


//for routing with the jquery tabs ui
app.get('/newsRaw', routes.newsRaw);
app.get('/hoursRaw', routes.hoursRaw);
app.get('/trafficRaw', routes.trafficRaw);
app.get('/groupFitnessRaw', routes.groupFitnessRaw);
app.get('/intramuralsRaw', routes.intramuralsRaw);
app.get('/programsRaw', routes.programsRaw);


