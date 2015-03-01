var http = require('http'),
    express = require('express'),
    exec = require('exec'),
    _ = require('lodash'),
    fs = require('fs'),
    watch = require('watch'),
    request = require('request'),
    xml2json = require('xml-to-json'),
    csv = require('csv-to-json'),
    isOnline = require('is-online'),
    app = express();


var config = {
  port: 3000,
  endpoint: 'http://requestb.in/1i5ulv01',
  env: process.env.NODE_ENV || 'dev',
  interface: 'wlan0'
};

var state = {
  newData: false
};

var requestOptions = {
  method: 'post',
  json: true,
  url: config.endpoint
};


//-------------------------------------------
// Create server
//-------------------------------------------

var server = app.listen(config.port, function() {
    console.log('Starting up on port: ' + config.port);

    if (config.env !== 'dev') {
      // Only init if we're running it on the target environment
      init();
    } else {
      // If we're running it in dev
      startWatching();
    }
});


function init() {
  exec('cd ./data;airodump-ng -w dump ' + config.interface, function(err, out, code) {
    if (err instanceof Error) {
      if (err.code === 'ENOENT') {
        throw new Error('airodump command not found.');
      }

      startWatching();
      process.stderr.write(err);
      process.stdout.write(out);
      process.exit(code);
    }
  });
}


function startWatching() {
  console.log('Watching for changes to airodump data');

  watch.createMonitor('./data', function (monitor) {
    monitor.on("changed", function (file, curr, prev) {
      console.log('File changed: ' + file);
      parseData(file);
    });
  });
}


function parseData(file) {
  console.log('Parsing data');

  fs.readFile(file, 'utf-8', function(err, data) {
    if (err) throw err

    // Check if we're online
    isOnline(function(err, online) {
      if (err) throw err;

      if (online === true) {
        // Device is online
        console.log('Device is online');
        var json = JSON.parse(data);
        postData(json);
      } else {
        // Device is offline
        console.log('Device is offline. Waiting for device to come online to post data.');
        // TODO: if there's new data, post it when we come online
        state.newData = true;
        checkConnection();
      }
    });

  });
}


function postData(json) {
  console.log('Posting data to: ' + config.endpoint);

  requestOptions.body = json;

  request(requestOptions, function(err, response, body) {
    if (err) throw err
    console.log(body);
  });
}


function checkConnection() {
  console.log('Checking for new data');
  // Check for new data every minute

  setInterval(function(){
    // TODO: check if online.
    //       check if new data is available.
    //       post the data if the conditions are met.
    //       reset data state
  }, 60000);
}


// Routes
//-------------------------------------------


app.get('/test', function(req, res) {
  console.log('test');
  res.sendStatus(200);
});

