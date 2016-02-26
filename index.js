/*!
 * Copyright © 2015 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 * 
 * Description:
 * Entry point of the server application.
 */

var express = require('express'),
    path = require('path'),
    time = require('simple-time'),
    request = require('request'),
    OAuth = require('oauth-1.0a');

// Express app and global middleware.
var app = express(),
    morgan = require('morgan'),
    compression = require('compression');

// Twitter OAuth API token, consumer key and secrets.
var twOAuth = OAuth({
    consumer: {
        public: process.env.TW_CONSUMER_KEY,
        secret: process.env.TW_CONSUMER_SECRET
    },
    signature_method: 'HMAC-SHA1'
});

var twToken = {
    public: process.env.TW_TOKEN,
    secret: process.env.TW_TOKEN_SECRET,
};

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

// Serve static files.
// TODO: When things settle down a little bit, set Cache-Control header
// to a reasobale max-age value and start versioning static assets. By
// now, changes are too frequent and it doesn't make much sense.
app.use(express.static('static'));

// Serve static index.html file.
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Twitter endpoint used by the client to retrieve tweets as JSON from
// the Twitter API. Excludes retweets and replies and accepts a count
// parameter with the max number of tweets to fetch (see Twitter API
// for more details).
app.get('/tweets', function(req, res) {

  var reqData = {
    url: 'https://api.twitter.com/1.1/statuses/'
                                      + 'user_timeline.json'
                                      + '?trim_user=true'
                                      + '&include_rts=false'
                                      + '&exclude_replies=true',
    method: 'GET'
  };

  var count = parseInt(req.query.count);

  if (count) {
    reqData.url += '&count=' + count;
  }

  request({
    url: reqData.url,
    method: reqData.method,
    headers: twOAuth.toHeader(twOAuth.authorize(reqData, twToken))
  }, function(error, resp, body) {
    res.setHeader('Content-Type', 'application/json');
    if (error) {
      res.status(500).send({ error: 'Something blew up...' });
    } else {
      res.status(resp.statusCode)
         .send(resp.body || { error: resp.statusMessage });
    }
  });

});

// Reply with a 404 if nothing previously matches.
app.use(function(req, res) {
  res.status(404).send('Not found!');
})

// Start the HTTP server.
app.listen(app.get('port'), function() {
  console.log('HTTP server listening on port ' + app.get('port'));
});
