const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
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

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
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
});
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
