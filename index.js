/*!
 * Copyright © 2015 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 * 
 * Description:
 * Entry point of the server application.
 */

var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    time = require('simple-time');

// Express app and global middleware.
var app = express(),
    morgan = require('morgan'),
    compression = require('compression');

// Request and oauth-1.0a for sending authenticated requests to the
// Twitter API on behalf of '@enekodev' user.
var request = require('request'),
    OAuth = require('oauth-1.0a');

// Nodemailer and xoauth2 for sending mails through Gmail on behalf
// of <contact@eneko.me> (a Google Apps account with custom domain).
var nodemailer = require('nodemailer'),
    xoauth2 = require('xoauth2');

// Twitter OAuth 1.0a API token, consumer key and their secrets.
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

// Nodemailer's Gmail transporter with xoauth2 authentication. The
// xoauth2 generator logs into the <contact@eneko.me> Gmail account
// and generates the acces tokens for Nodemailer.
var gmTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    xoauth2: xoauth2.createXOAuth2Generator({
      user: 'contact@eneko.me',
      clientId: process.env.GM_CLIENT_ID,
      clientSecret: process.env.GM_CLIENT_SECRET,
      refreshToken: process.env.GM_REFRESH_TOKEN
    })
  }
});

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

// Parse application/json content-type bodies (populates req.body).
app.use(bodyParser.json());

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

// Endpoint to send mails on behalf of the Gmail account defined in
// nodemailer transporter's authentication service.
app.post('/sendmail', function(req, res) {
  if (isValidMail(req.body.from)) {
    gmTransporter.sendMail({
      from: 'contact@eneko.me',
      to: 'contact@eneko.me',
      subject: '[eneko.me] ['
                + req.body.from + '] '
                + req.body.subject,
      text: req.body.text
    }, function(error, resp) {
       if (error) {
          res.status(500).send({ error: 'Something blew up...' });
       } else {
          res.send();
       }
    });
  } else {
    res.status(400).send({ error: 'Wrong e-mail address.' });
  }

  /**
   * Validates an e-mail address.
   * 
   * @param  {String}  email  E-mail address.
   * 
   * @return {Boolean}        True if valid, false otherwise.
   */
  function isValidMail(email) {
    var mailRegExp = /^.+@.+\..+$/;
    return mailRegExp.test(email);
  }
});

// Reply with a 404 if nothing previously matches.
app.use(function(req, res) {
  res.status(404).send('Not found!');
})

// Start the HTTP server.
app.listen(app.get('port'), function() {
  console.log('HTTP server listening on port ' + app.get('port'));
});
