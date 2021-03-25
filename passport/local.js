const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const User=require('../models/user');
const bcrypt=require('bcryptjs');
passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(error,user)=>{
        done(error,user);
    });
});
passport.use(new LocalStrategy({
    usernameField:'email',
    passwordField:'password'
},(email,password,done)=>{
    User.findOne({email:email})
    .then((user)=>{
        if(!user){
            return done(null,false);
        }
        bcrypt.compare(password,user.password,(error,isMatch)=>{
            if(error){
                return done(error);
            }
            if(isMatch){
                return done(null,user);
            }else{
                return done(null,false);
            }
        });    
    }).catch((error)=>{
        console.log(error);
    });
}));