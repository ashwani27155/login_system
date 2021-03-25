const express = require('express');

const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport=require('passport');//f
const cookieParser=require('cookie-parser');//f
const session=require('express-session');//f
const flash=require('connect-flash');
const bcrypt=require('bcryptjs');

const Handlebars=require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const Message = require('./models/message');
const app = express();
const Keys = require('./config/keys');
//load helpers
const{requireLogin,ensureGuest}=require('./helpers/auth');
const port = process.env.PORT || 3000;
const User=require('./models/user');//f
//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//configuration for facebook authentication
app.use(cookieParser());//f
app.use(session({
    secret:'mysecret',
    resave:true,
    saveUninitialized:true
}))//f
app.use(passport.initialize());//f
app.use(passport.session());//f
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success_msg');
    res.locals.error_msg=req.flash('error_msg');
    res.locals.error=req.flash('error');
    next();
});
//setup express static folder to serve js and css files
app.use(express.static('public'));
//make user global object
app.use((req,res,next)=>{
    res.locals.user=req.user||null;
    next();
});
//load facebook strategy
require('./passport/facebook');//f
require('./passport/google');//g
require('./passport/local')//l
mongoose.connect(Keys.MongoDB, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {console.log('Server is connected to MongoDB');})
    .catch((error) => {console.log(error);}
);

app.engine('handlebars', exphbs({
     defaultLayout: 'main',
     handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars')

app.get('/',ensureGuest, (req, res) => {
    res.render('home', {
        title: 'Home'
    });
});
app.get('/about',ensureGuest, (req, res) => {
    res.render('about', {
        title: 'About'
    });
});
app.get('/contact',ensureGuest, (req, res) => {
    res.render('contact', {
        title: 'Contact'
    });
});
//f
app.get('/auth/facebook',passport.authenticate('facebook',{
    scope:['email']
}));
app.get('/auth/facebook/callback',passport.authenticate('facebook',{
    successRedirect:'/profile',
    failureRedirect:'/'
}));
//g
app.get('/auth/google',passport.authenticate('google',{
    scope:['profile']
}));
app.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect:'/profile',
    failureRedirect:'/'
}))
//g
app.get('/profile',requireLogin,(req,res)=>{
    User.findById({_id:req.user._id}).then((user)=>{
        if(user){
           user.online=true;
           user.save((error,user)=>{
               if(error){
                   throw error;
               }else{
                res.render('profile',{
                    title:'profile',
                    user:user
                });
               }
           })
        }
    });
});
//f
//for signup 
app.get('/newAccount',(req,res)=>{
    res.render('newAccount',{
        title:'Signup'
    });
});
app.post('/signup',(req,res)=>{
    //console.log(req.body);
    let errors=[];
    if(req.body.password!==req.body.password2){
        errors.push({text:'Password does not match!'});
    }
    if(req.body.password.length<5){
        errors.push({text:'Password must be at least 5 character'});
    }
    if(errors.length>0){
        res.render('newAccount',{
            errors:errors,
            title:'Error',
            fullname:req.body.username,
            email:req.body.email,
            password:req.body.password,
            password:req.body.password2
        });
    }else{
        User.findOne({email:req.body.email})
        .then((user)=>{
            if(user){
                let errors=[];
                errors.push({text:'Email already exist'});
                res.render('newAccount',{
                    title:'Signup',
                    errors:errors
                })
            }else{
                //bcrypt setup
                var salt=bcrypt.genSaltSync(10);
                var hash=bcrypt.hashSync(req.body.password,salt);
                const newUser={
                    fullname:req.body.username,
                    email:req.body.email,
                    password:hash
                }
                //saving form data into database
                new User(newUser).save((error,user)=>{
                    if(error){
                        throw error;
                    }
                    if(user){
                        let success=[];
                        success.push({text:'You are successfully created account.You can login now'});
                        res.render('home',{
                            success:success
                        });
                    }
                })
            }
        })
    }
});
app.post('/login',passport.authenticate('local',{
    successRedirect:'/profile',
    failureRedirect:'/loginErrors'
}));
app.get('/loginErrors',(req,res)=>{
    let errors=[];
    errors.push({text:'User Not found or Password Incorrect'});
    res.render('home',{
        errors:errors
    });
})
//facebook logout code
app.get('/logout',(req,res)=>{
    User.findById({_id:req.user._id})
    .then((user)=>{
        user.online=false;
        user.save((error,user)=>{
            if(error){
                throw error;
            }
            if(user){
                req.logout();
                res.redirect('/');
            }
        })
    })
});
//fl
app.post('/contactus', (req, res) => {
    console.log(req.body);
    const newMessage={
        fullname:req.body.fullname,
        email:req.body.email,
        message:req.body.message,
        date:new Date()
    }
    new Message(newMessage).save((error,message)=>{
        if(error){
            throw error;
        }else{
            Message.find({}).then((messages)=>{
                if(messages){
                 res.render('newmessage',{
                     title:'Sent',
                     messages:messages
                });
         }
         else{
             res.render('nomessage',{
                 title:'Not Found'
             });
         }
             });
         }
         });
         });
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
