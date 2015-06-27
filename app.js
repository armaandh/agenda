var express = require('express'),
    basicAuth = require('basic-auth'),
    path = require('path');
    
var mongoose = require('mongoose'); 
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Configure basic auth
//var basic = auth.basic({
  //  realm: 'Personal Goals Tracker'
//}, function(username, password, callback) {
  //  callback(username == 'sophie' && password == 'trophy');
//});

//configuration 
 mongoose.connect('mongodb://solrflow:Ryutachi1324!@apollo.modulusmongo.net:27017/ditipU4g'); 

// Set up express app
var app = express();
app.use(express.static("./public"));
app.use(morgan('dev'));  
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
// Create middleware that can be used to protect routes with basic auth
//var authMiddleware = auth.connect(basic);

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };
  
  var user = basicAuth(req);
  
  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'foo' && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  };
};


// Configure an unprotected route 
//app.get('/', function(request, response) {
  //  response.send('A&S Tracker: <a href="/secret">여기</a>');
//});

// define model =================
    var Todo = mongoose.model('Todo', {
        text : String,
        dob: { type: Date, default: Date.now() },
        done : Boolean
    });
    
   
// api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function(req, res) {

        // use mongoose to get all todos in the database
        Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });
    });

    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            text : req.body.text,
            dob : new Date(),
            done : req.body.done
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            Todo.find(function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });

    });
    

// Protected route
app.get('/index', auth, function(request, response) {
     response.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(3000);
