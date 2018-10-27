passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

const User = require('../models/user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({'email':email}, (err, user) => {
        if(err){
            return done(err);
        }

        if(user){
            return done(null, false, req.flash('error', 'User With this Email Already Exist.'));
        }

        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);

        newUser.save((err) => {
            return done(null, newUser);
        });
    })
}));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {     
    User.findOne({'email':email}, (err, user) => {
        if(err){
            return done(err);
        }
        
        var messages = [];
        
        if(!user){
            messages.push('Email Does Not Exist')
            return done(null, false, req.flash('error', messages));
        } else if (!user.password){
            messages.push('Email already use facebook or Google login, Please reset password')
            return done(null, false, req.flash('error', messages));
        } else if (!user.validPassword(password)){
            messages.push('Password is Invalid')
            return done(null, false, req.flash('error', messages));
        }
        
        return done(null, user); 
    });
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FBClientID,
    clientSecret: process.env.FBClientSecret,
    profileFields: ['email', 'displayName'],
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    passReqToCallback: true
    }, (req, token, refreshToken, profile, done) => {       
    User.findOne({'email':profile._json.email}, (err, user) => {
        if(err)
            return done(err);
        if (!user){
            const newUser = new User();
            newUser.facebook.id = profile.id;
            newUser.fullname = profile.displayName;
            newUser.email = profile._json.email;
            newUser.facebook.token = token;
        
            newUser.save(function(err) {
                if(err){
                    console.log(err);
                }
                return done(null, newUser);
            })
        } else {
            if (user.facebook.id !== profile.id){
                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.fullname = profile.displayName;
                user.save(function(err) {
                    if (err)
                        return done(err);                           
                        return done(null, user);
                });
            }
            return done(null, user);
        }       
    })
}))

passport.use(new GoogleStrategy({
    clientID        : process.env.googleClientID,
    clientSecret    : process.env.googleClientSecret,
    callbackURL     : 'http://localhost:5000/auth/google/callback',
    passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    }, (req, token, refreshToken, profile, done) => {
        User.findOne({'email':profile.emails[0].value}, (err, user) => {
            if(err)
                return done(err);
            if (!user){
                const newUser = new User();
                newUser.google.id = profile.id;
                newUser.google.token = token;
                newUser.fullname  = profile.displayName;
                newUser.email = profile.emails[0].value; // pull the first email

                newUser.save(function(err) {
                    if (err)
                        return done(err);            
                        return done(null, newUser);
                });
            } else {
                if (user.google.id !== profile.id){
                    user.google.id = profile.id
                    user.google.token = token;
                    user.fullname  = profile.displayName;
                    user.save(function(err) {
                        if (err)
                            return done(err);                           
                            return done(null, user);
                    });
                }           
                return done(null, user);
            }            
        })
    }))

