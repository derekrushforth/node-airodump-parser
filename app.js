var http = require('http'),
    express = require('express'),
    _ = require('lodash'),
    app = express(),
    env = process.env.NODE_ENV || 'dev',
    fs = require('fs'),
    watch = require('watch'),
    request = require('request');

var endpoint = 'http://requestb.in/1i5ulv01';

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

    startWatching();
    // TODO: Exec airodump cmd
    // TODO: Start watching
});

function startWatching() {
  console.log('Watch');

  watch.createMonitor('./data', function (monitor) {
    monitor.on("changed", function (f, curr, prev) {
      console.log('changed');
      console.log(curr);
      // TODO: parse changed file
    });
  });
}

function parse() {
  console.log('Parse');

  fs.readFile('data/kismet.json', 'utf-8', function(err, data) {
    if (err) throw err;

    var json = JSON.parse(data);

    var options = {
      method: 'post',
      body: json,
      json: true,
      url: endpoint
    }

    request(options, function(err, response, body) {
      if (err) throw err
      console.log(body);
    });

  });
}


// Routes
//-------------------------------------------


app.get('/test', function(req, res) {
  console.log('test');
  res.sendStatus(200);
});

