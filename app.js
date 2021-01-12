var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars')
var adminRouter = require('./routes/admin');
var hotelRouter = require('./routes/hotel');
var userRouter = require('./routes/user');
var db=require('./config/connection')
var session=require('express-session')
var fileUpload=require('express-fileupload')

var app = express();

// view engine setup
app.use(function(req,res,next){
  res.set('Cache-Control','no-cache,private,no-store,must-revalidat,max-stale=0,post-check=0,pre-check=0')
  next()
})
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({secret:"key",cookie:{maxAge:6000000}}))
db.connect((err)=>{
  if(err)console.log('database not connected');
  else console.log("Database connected to port 27017");
})
app.use('/admin', adminRouter);
app.use('/hotel', hotelRouter);
app.use('/', userRouter);

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

module.exports = app;
