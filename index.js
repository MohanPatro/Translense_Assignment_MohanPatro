require('dotenv').config();
const express=require('express');
const app=express();

app.use(express.json());

app.use(express.urlencoded({extended:false}));

const router=require('./routes/registrationRoutes');

app.use(router);



const port=process.env.PORT;

app.listen(port,()=>{
    console.log(`app is running on port number ${3000}`);
})