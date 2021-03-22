const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const Handlebars=require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const Message = require('./models/message');
const app = express();
const Keys = require('./config/keys');
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(Keys.MongoDB, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {console.log('Server is connected to MongoDB');})
    .catch((error) => {console.log(error);}
);

app.engine('handlebars', exphbs({
     defaultLayout: 'main',
     handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars')

app.get('/', (req, res) => {
    res.render('home', {
        title: 'Home'
    });
});
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    });
});
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact'
    });
});
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
