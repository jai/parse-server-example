// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  databaseUri='mongodb://localhost:27017/ramen-beast';
  process.env.SERVER_URL='http://localhost:1337/parse';
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_312nt0sc:u0ise00hoq29482e31b30fh4gq@ds151618-a0.mlab.com:51618,ds151618-a1.mlab.com:51618/heroku_312nt0sc?replicaSet=rs-ds151618',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '0JaZQrVZ27THPwguhl3M0kiPgCpoiKLRgDYk4H2j',
  masterKey: process.env.MASTER_KEY || '7aHFy7s7DTdQJiGJYgqsowcCbxLoJKh3', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://ramen-beast.herokuapp.com/parse',  // Don't forget to change to https if needed
  filesAdapter: new S3Adapter(
  	"AKIAIQVBGTZBES6KF32Q",
	"lKin+njcwb2sctqSlWJRplAPmq3PykiA+Ek2JEuJ",
	  "ramen-beast-assets",
	  {directAccess: true}
	  ),
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
