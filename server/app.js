//INITIAL SETUP
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors=require("cors");
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.on('open', () => console.log('Connection to the Database is Successful'));
const PORT = process.env.PORT || 8080;

//Setup the server to accept JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Enable the service for CORS.
const corsOptions ={
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}
app.use(cors(corsOptions))

//Create Routing
const userProfileRouter = require('./routes/userProfile');
app.use('/user', userProfileRouter);

const oauthRoute = require('./routes/auth');
app.use('/api/login', oauthRoute);

const bookRoute = require('./routes/book');
app.use('/api/book', bookRoute);

const userBooksRoute = require('./routes/myBooks');
app.use('/api/mybooks', userBooksRoute);

const userActivityRoute = require('./routes/userActivity');
app.use('/api/userActivity', userActivityRoute);

app.listen(PORT, () => console.log("Server is up & running!"));

