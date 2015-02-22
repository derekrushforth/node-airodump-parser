var http = require('http'),
    express = require('express'),
    _ = require('lodash'),
    app = express(),
    env = process.env.NODE_ENV || 'dev',
    fs = require('fs');


//-------------------------------------------
// Config
//-------------------------------------------
var config = {
  port: (env === 'dev') ? 3002 : 80
};


//-------------------------------------------
// Create server
//-------------------------------------------

var server = app.listen(config.port, function() {
    console.log('Starting up on port: ' + config.port);
});



// Routes
//-------------------------------------------




app.get('/t', function(req, res) {
  console.log('test');
  res.sendStatus(200);
});

app.post('/data', function(req, res) {
  console.log('test 2  ');
  res.send('POST request to /data');
  res.sendStatus(200);
});

