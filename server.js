var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var validator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');

require('./config/passport');
require('dotenv').config();
var app = express();


app.use(validator());


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connect'))
.catch(err => console.log(err))



app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view engine',  'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());



app.use(session({
	secret: process.env.SECRET,
	resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

require('./routes/user')(app, passport);



const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
    console.log('Port is running' + PORT);
})

