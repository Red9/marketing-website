var express = require('express');
var redirect = require('express-redirect');
var compression = require('compression');
var pg = require('pg');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var app = express();
var connectionString = 'postgres://red9:Red9Marketing778@localhost/red9marketing'

// Setup plugins
redirect(app); 
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));


// Redirects for dev site
app.redirect("/dataset/:id", "http://data.redninesensor.com/dataset/:id", 301);
app.redirect("/event/:id", "http://data.redninesensor.com/event/:id", 301);

// End point for storing emails
app.post('/register', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	// parse body
	var email = req.body.email;
	var fullName = req.body.fullName;
	var postal = req.body.postal;

	// console.log(email, fullName, postal);
	if (!email || !fullName || !postal) { 
		res.status(500).send('Missing Fields (bad request)').end();
		return;
	}

	pg.connect(connectionString, function (err, client, done) {
		var handleError = function (err) {
			if (!err) return false;
			console.log(err + (new Date()).toString());
			done(client);
			res.status(500).send('Bad Request'); // TODO make this more descriptive.
			return true;
		};

		client.query('INSERT INTO registrations (email, fullname, postalcode) VALUES ($1, $2, $3)',
					[email, fullName, postal], 
					function (err, result) {
						if (handleError(err)) return;

						done();
						res.status(200).send('success');
		});
	});
});

app.listen(80, function () {
	console.log('Started web server at ' + (new Date()).toISOString());
});