const express = require('express'),
    config = require('./configure'),
    mongoose = require('mongoose');

let app = express(); 

app.set('port', process.env.PORT || 3300);
console.log(__dirname);
app.set('views', __dirname + '/../views');
app = config(app);

mongoose.connect('mongodb://localhost:27017/imgPloadr', { useNewUrlParser: true },);
const db = mongoose.connection;
db.on('open',  () => {
    console.log('Mongoose connected.');
});
// app.get('/', (req, res) => {
//     res.send('Hello world');
// });

app.listen(app.get('port'), () => {
    console.log('Server up: http://localhost:' + app.get('port'));
});