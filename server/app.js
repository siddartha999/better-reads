//INITIAL SETUP
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.on('open', () => console.log('Connection to the Database is Successful'));
const PORT = process.env.PORT || 8080;

//Setup the server to accept JSON
app.use(express.json());
//app.use(cookieParser());

//Create Routing
const userProfileRouter = require('./routes/userProfile');
app.use('/user', userProfileRouter);

const googleOauthRoute = require('./routes/getGoogleOauthUrlRoute');
const cookieParser = require('cookie-parser');
app.use('auth/google/url', googleOauthRoute);

app.listen(PORT, () => console.log("Server is up & running!"));

