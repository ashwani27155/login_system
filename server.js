//load express module
const express=require('express');
//load express-handlebars module
const exphbs=require('express-handlebars');
//loas body-parser
const bodyParser=require('body-parser');
//load mongoose
const mongoose=require('mongoose');
//load models
const Message=require('./models/message');
const app=express();
//load keys file
const Keys=require('./config/keys');
//use body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//connect to mlab(database)
mongoose.connect(Keys.MongoDB,{useUnifiedTopology:true,useNewUrlParser:true}).then(()=>{
    console.log('Server is connected to MongoDB');
}).catch((error)=>{
    console.log(error);
});
//environment variable for port

const port=process.env.PORT || 3000;
//setup view engine
app.engine('handlebars',exphbs({defaultLayout:'main'}));//express having engine module for defining view engine
app.set('view engine','handlebars')

app.get('/',(req,res)=>{
    //rendering html templet
    res.render('home',{
        title:'Home'
    });
});
app.get('/about',(req,res)=>{
    res.render('about',{
        title:'About'
    });
});
app.get('/contact',(req,res)=>{
    res.render('contact',{
        title:'Contact'
    });
});
app.post('/contactus',(req,res)=>{
    console.log(req.body);
    //
});
app.listen(port,()=>{
    console.log('Server is running on port '+port);
});
