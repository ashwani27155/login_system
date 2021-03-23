const passport=require('passport');//f
const FacebookStrategy=require('passport-facebook').Strategy;//f
const User=require('../models/user');//f
const keys=require('../config/keys');//f
passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(error,user)=>{
        done(error,user);
    });
});
passport.use(new FacebookStrategy({
    clientID:keys.facebookAppID,
    clientSecret:keys.facebookAppSecret,
    callbackURL:'http://localhost:3000/auth/facebook/callback',
    profileFields:['email','name','displayName','photos']
},(accessToken,refreshToken,profile,done)=>{
    console.log(profile);
    User.findOne({facebook:profile.id},(error,user)=>{
        if(error){
            return done(error);
        }
        if(user){
            return done(null,user);
        }else{
            const newUser={
                facebook:profile.id,
                fullname:profile.displayName,
                lastname:profile.name.familyName,
                firstname:profile.name.givenName,
                image:`https://graph.facebook.com/${profile.id}/photos?type=large`,
                email:profile.emails.value[0]
            }
            new User(newUser).save((error,user)=>{
                if(error){
                    return done(error);
                }
                if(user){
                    return done(null,user);
                }
            });
        }
    });
}));