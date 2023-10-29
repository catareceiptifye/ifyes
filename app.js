const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');

const app = express();

const CLIENT_ID = '1164966531994750986';
const CLIENT_SECRET = 'tkDYC3PlA8CElSb9A5SbZrdqBKorMhav';
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback';

app.use('/check', express.static(__dirname + '/check'));  // Add this line

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
    scope: ['identify', 'guilds'] // <-- Add 'guilds' here
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));


function hasRequiredRole(profile, requiredGuildId, requiredRoleId) {
    const guild = profile.guilds.find(g => g.id === requiredGuildId);
    if (guild && guild.roles && guild.roles.includes(requiredRoleId)) {
        return true;
    }
    return false;
}




passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/dashboard.html');
});


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/welcome');  // Redirect to the welcome page after login
    }
);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');  // Redirect to Discord login if not authenticated
}

app.get('/website', ensureAuthenticated, (req, res) => {
    if (hasRequiredRole(req.user, '1133081598875680932', '1133089962368172113')) {
        res.send('Welcome to the protected website!');
    } else {
        res.send('You do not have the required role to access this site.');
    }
});



app.get('/welcome', ensureAuthenticated, (req, res) => {
    if (hasRequiredRole(req.user, '1133081598875680932', '1133089962368172113')) {
        res.sendFile(__dirname + '/views/welcome.html');
    } else {
        res.send('You do not have the required role to access this page.');
    }
});




app.get('/check', ensureAuthenticated, (req, res) => {
    if (hasRequiredRole(req.user, '1133081598875680932', '1133089962368172113')) {
        res.sendFile(__dirname + '/check/checkcheck.html');
    } else {
        res.send('You do not have the required role to access this site.');


    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
