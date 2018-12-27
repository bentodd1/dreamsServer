const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
var fs = require('fs');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

app.use('/public', express.static(__dirname + '/public'));

/** Implementing Simple Music Server using Express JS **/
app.get('/music', function (req, res) {
  // File to be served

  var fileId = req.query.id;
  var file = __dirname + '/music/' + fileId;
  fs.exists(file, function (exists) {
    if (exists) {
      var rstream = fs.createReadStream(file);
      rstream.pipe(res);
    } else {
      res.send("Its a 404");
      res.end();
    }

  });

});
app.get('/download', function (req, res) {
  var fileId = req.query.id;
  var file = __dirname + '/music/' + fileId;
  fs.exists(file, function (exists) {
    if (exists) {
      res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
      res.setHeader('Content-Type', 'application/audio/mpeg3')
      var rstream = fs.createReadStream(file);
      rstream.pipe(res);
    } else {
      res.send("Its a 404");
      res.end();
    }
  });


});



if(!isProduction) {
  app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect('mongodb://localhost/passport-tutorial');
mongoose.set('debug', true);

//Models & routes
require('./models/Users');

require('./config/passport');

app.use(require('./routes'));

//Error handlers & middlewares
if(!isProduction) {
  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use((err, req, res) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

app.listen(8000, () => console.log('Server running on http://localhost:8000/'));
