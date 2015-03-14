var http = require('http'),
    express = require('express'),
    fs = require('fs'),
    watch = require('watch'),
    request = require('request'),
    parser = require('xml2json'),
    spawn = require('child_process').spawn,
    isOnline = require('is-online'),
    path = require('path'),
    app = express();


/* -------------------------------
    CONFIGURE YOUR SETTINGS 
 ------------------------------- */
var config = {
  port: 3030,
  interface: 'wlan0',
  dumpName: 'dump',
  endpoint: process.env.NODE_ENV === 'dev' ? 'http://192.168.1.15:3005/data':'http://reality-versioning-api.herokuapp.com/data',
  env: process.env.NODE_ENV || ''
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
    console.log('child process exited with code ' + code + '. Make sure your wifi device is set to monitor mode.');
  });

  // TODO: Start this when cmd is connected instead of on a timeout
  setTimeout(function() {startWatching();}, 5000);
}


function startWatching() {
  console.log('Watching for changes to airodump data');

  // Watch for file changes in data folder
  watch.createMonitor('./data', function (monitor) {
    monitor.on('changed', function (file, curr, prev) {

      // Filter out netxml files
      if (path.extname(file) === '.netxml') {
        parseData(file);
      }
      
    });
  });
}


function parseData(file) {
  console.log('Parsing data for: ' + file);

  try {
    var xml = fs.readFileSync(file),
      data = parser.toJson(xml, {
        sanitize: true
      });

    isOnline(function(err, online) {
      if (err) throw err;

      if (online === true) {
        // Device is online
        console.log('Device is online');
        postData(data);
      } else {
      }
    });
  } catch(e) {
    console.log('There was an error parsing your xml');
    console.log(e);
  }
  
}


function postData(json) {
  console.log('Posting data to: ' + config.endpoint);

  try {
    requestOptions.body = JSON.parse(json);

    request(requestOptions, function(err, response, body) {
      if (err) throw err
      console.log('Response from API -------------------');
      console.log(body);
    });
  } catch (e) {
    console.log('There was an error in the request to the API');
    console.log(e);
  }
  
}


// Routes
//-------------------------------------------


app.get('/test', function(req, res) {
  console.log('test');
  res.status(200).end('OK');
});

