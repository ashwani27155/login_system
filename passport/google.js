const passport=require('passport');
const GoogleStrategy=require('passport-google-oauth20').Strategy;
const User=require('../models/user');
const keys=require('../config/keys');
passport.serializeUser((user,done)=>{
    return done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(error,user)=>{
        return done(error,user);
    });
});
passport.use(new GoogleStrategy({
    clientID:keys.GoogleClintID,
    clientSecret:keys.GoogleClintSecret,
    callbackURL:'http://localhost:3000/auth/google/callback'
},(accessToken,refreshToken,profile,done)=>{
    console.log(profile);
    User.findOne({google:profile.id},(error,user)=>{
        if(error){
            throw error;
        }
        if(user){
            return done(null,user);
        }else{
            const newUser={
                firstname:profile.name.givenName,
                lastname:profile.name.familyName,
                image:profile.photos[0].value.substring(0,profile.photos[0].value.indexOf('?')),
                fullname:profile.displayName,
                google:profile.id
            }
            new User(newUser).save((error,user)=>{
                if(error){
                    return done(err);
                }
                if(user){
                    return done(null,user);
                }
            });
        }
    });
}));