//load express module
const express=require('express');
//load express-handlebars module
const exphbs=require('express-handlebars');
const app=express();
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
app.listen(port,()=>{
    console.log('Server is running on port '+port);
});
