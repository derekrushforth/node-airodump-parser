var http = require('http'),
    express = require('express'),
    _ = require('lodash'),
    fs = require('fs'),
    watch = require('watch'),
    request = require('request'),
    parser = require('xml2json'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    isOnline = require('is-online'),
    path = require('path'),
    app = express();


var config = {
  port: 3030,
  endpoint: process.env.NODE_ENV === 'dev' ? 'http://localhost:3005/data':'http://reality-versioning-api.herokuapp.com/data',
  env: process.env.NODE_ENV || '',
  interface: 'wlan0',
  dumpName: 'dump'
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
  console.log('Attempt to execute airodump-ng');

  //ls.stdout.pipe(process.stdout);

  var cmd = spawn('airodump-ng', [
    '-w ' + config.dumpName, 
    config.interface
  ], {cwd: './data'});

  //var cmd = spawn('top',['-l 0']);
  //console.log(cmd.connected);

  cmd.stdout.on('data', function (data) {
    //console.log('stdout: ' + data);
  });

  cmd.stderr.on('data', function (data) {
    //console.log('stderr: ' + data);
  });

  cmd.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });

  // TODO: Start this when cmd is connected instead of on a timeout
  setTimeout(function() {startWatching();}, 10000);
}


function startWatching() {
  console.log('Watching for changes to airodump data');

  watch.createMonitor('./data', function (monitor) {
    monitor.on("changed", function (file, curr, prev) {
      console.log('File changed: ' + file);

      // Filter out netxml files
      if (path.extname(file) === '.netxml') {
        parseData(file);
      }
      
    });
  });
}


function parseData(file) {
  console.log('Parsing data');

  var xml = fs.readFileSync(file),
      data = parser.toJson(xml);

  isOnline(function(err, online) {
    if (err) throw err;

    if (online === true) {
      // Device is online
      console.log('Device is online');
      postData(data);
    } else {
      // Device is offline
      console.log('Device is offline. Waiting for device to come online to post data.');
      // TODO: if there's new data, post it when we come online
      state.newData = true;
      checkConnection();
    }
  });
}


function postData(json) {
  console.log('Posting data to: ' + config.endpoint);

  requestOptions.body = JSON.parse(json);

  request(requestOptions, function(err, response, body) {
    if (err) throw err
      console.log(body);
    console.log('Response: ' + body);
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

