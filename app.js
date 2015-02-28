var http = require('http'),
    express = require('express'),
    exec = require('exec'),
    _ = require('lodash'),
    fs = require('fs'),
    watch = require('watch'),
    request = require('request'),
    isOnline = require('is-online'),
    app = express();


//-------------------------------------------
// Config
//-------------------------------------------
var config = {
  port: 3000,
  endpoint: 'http://requestb.in/1i5ulv01',
  env: process.env.NODE_ENV || 'dev'
};


//-------------------------------------------
// Create server
//-------------------------------------------

var server = app.listen(config.port, function() {
    console.log('Starting up on port: ' + config.port);

    isOnline(function(err, online) {
      console.log('is online: ' + online);
    });
    
    //init();
    startWatching();
});

function init() {
  exec('cd ./data;airodump-ng -w dump wlan0', function(err, out, code) {
    if (err instanceof Error) {
      if (err.code === 'ENOENT') {
        throw new Error('airodump command not found.');
      }

      //startWatching();
      process.stderr.write(err);
      process.stdout.write(out);
      process.exit(code);
    }
  });
}

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
      url: config.endpoint
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

