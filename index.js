/*!
 * Copyright © 2015 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 * 
 * Description:
 * Entry point of the server application.
 */

var express = require('express'),
    path = require('path'),
    time = require('simple-time');

// Express app, controllers and global middleware.
var app = express(),
    morgan = require('morgan'),
    compression = require('compression');

// Set server port.
app.set('port', process.env.PORT || 3000);

// Use gzip compression.
app.use(compression());

// Logging middleware in the development environment.
// Environment mode (app.get('env') or app.settings.env) defaults to
// process.env.NODE_ENV environmental var ('development' if not set).
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
}

// Serve static assets.
app.use(express.static('public', { maxAge:  30 * time.DAY }));

// Serve static files.
app.use(express.static('static'));

// Serve html.
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Send 404 if nothing previously matches.
app.use(function(req, res) {
res.status(404).send('Not found!');
})

// Start the HTTP server.
app.listen(app.get('port'), function() {
  console.log('HTTP server listening on port ' + app.get('port'));
});
