const express = require('express');

const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport=require('passport');//f
const cookieParser=require('cookie-parser');//f
const session=require('express-session');//f

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
//make user global object
app.use((req,res,next)=>{
    res.locals.user=req.user||null;
    next();
});
//load facebook strategy
require('./passport/facebook');//f
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
