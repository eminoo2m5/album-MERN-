var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
// Database
var monk = require('monk');
var db = monk('localhost:27017/assignment2');

var usersRouter = require('./routes/albums');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// Make our db accessible to routers
app.use(function(req,res,next){
req.db = db; next();
});

app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = app.listen(3002, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})
