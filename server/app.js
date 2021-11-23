//INITIAL SETUP
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.on('open', () => console.log('Connection to the Database is Successful'));

//Setup the server to accept JSON
app.use(express.json());

//Create Routing
const userProfileRouter = require('./routes/userProfile');
app.use('/user', userProfileRouter);

app.listen(process.env.PORT, () => console.log("Server is up & running!"));

