const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const LdapStrategy = require('passport-ldapauth');
const { users } = require('./models');
const { comparePassword } = require('./utils');

// Local Strategy (Username/Password)
passport.use('local', new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = users.find(u => u.username === username && u.authMethod === 'local');
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect username or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// OIDC/OAuth2 Strategy (Auth0, Okta, etc.)
if (process.env.OIDC_ENABLED === 'true') {
  passport.use('oidc', new OAuth2Strategy({
      authorizationURL: process.env.OIDC_AUTHORIZATION_URL,
      tokenURL: process.env.OIDC_TOKEN_URL,
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: process.env.OIDC_CALLBACK_URL || '/api/auth/oidc/callback',
      scope: ['openid', 'profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user info from profile
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const username = profile.username || profile.displayName || email;
        
        // Find or create user
        let user = users.find(u => u.email === email && u.authMethod === 'oidc');
        
        if (!user) {
          const { v4: uuidv4 } = require('uuid');
          const { User } = require('./models');
          
          user = new User({
            id: uuidv4(),
            username: username,
            email: email,
            password: null, // No password for OIDC users
            role: 'user',
            authMethod: 'oidc'
          });
          
          users.push(user);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

// LDAP Strategy
if (process.env.LDAP_ENABLED === 'true') {
  passport.use('ldap', new LdapStrategy({
      server: {
        url: process.env.LDAP_URL,
        bindDN: process.env.LDAP_BIND_DN,
        bindCredentials: process.env.LDAP_BIND_PASSWORD,
        searchBase: process.env.LDAP_SEARCH_BASE,
        searchFilter: process.env.LDAP_SEARCH_FILTER || '(uid={{username}})'
      }
    },
    async (user, done) => {
      try {
        // LDAP user info
        const username = user.uid || user.sAMAccountName || user.cn;
        const email = user.mail || user.email;
        
        // Find or create user
        let appUser = users.find(u => u.username === username && u.authMethod === 'ldap');
        
        if (!appUser) {
          const { v4: uuidv4 } = require('uuid');
          const { User } = require('./models');
          
          appUser = new User({
            id: uuidv4(),
            username: username,
            email: email,
            password: null, // No password stored for LDAP users
            role: 'user',
            authMethod: 'ldap'
          });
          
          users.push(appUser);
        }
        
        return done(null, appUser);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

// Serialize/deserialize user for session support (if needed)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

module.exports = passport;
