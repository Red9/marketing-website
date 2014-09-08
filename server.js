var express = require('express');
var compression = require('compression');
var pg = require('pg');
var bodyParser = require('body-parser');

var app = express();
var connectionString = 'postgres://red9:Red9Marketing778@localhost/red9marketing'

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


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



app.listen(80);