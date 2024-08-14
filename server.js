//Importing Modules
const express = require('express')
require('dotenv').config();
const mongoose =  require ('mongoose');


//connecting DB
mongoose.connect(process.env.MONGOBD_URI)

//initializing express 
const app= express();

//initializing view engine
app.set('view engine','ejs')
app.set('views','./views')

//defining server port thorugh ENV file
const port = process.env.SERVER_PORT | 3000;


//importing routes 
const userRoute = require('./routes/userRoute')
const authRoute = require('./routes/authRoute')

//defining api (using as a middleware) 

app.use('/api',userRoute)

app.use('/',authRoute)



//Starting Server on defined PORT
app.listen(port, function () {
    console.log("Server is running on PORT = ", port);
    
})