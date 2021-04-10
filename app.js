const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Vonage = require('@vonage/server-sdk');
const socketio = require('socket.io');
const from  ="18777022080";


//set app to express
const app = express();

//call vonage constructor and give it the api key 
const vonage = new Vonage({
   apiKey: '9d1729d2',
   apiSecret: 'Xhh8SknHTUV3pBsI'
   //set debug mode to true
},{debug: true});


//set the public folder where client side handles event listeners for form 
 app.set('view engine', 'html');
 //line below allows up to use .html files as views when rendering pages
 app.engine('html', ejs.renderFile);

 //define the folder destination being used with client side javascript
 //we created folder public then inside public create folder js then create main.js file in js folder
 app.use(express.static(__dirname + '/public'));

 //use this two lines of code for the body parsers which are now supported in express
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended: true}));

 //define a route to use 
 app.get('/',(req,res) => {
    res.render('index');
 });


 //catch the form submit
 app.post('/',(req,res) => {
     //request.body holds the form fields submitted
   const number = req.body.number;
   const text = req.body.text;


   //api communicating and sending text message 
   vonage.message.sendSms(from,number, text,{ type: 'unicode'},
   (err,responseData) => {
      if(err){
         console.log(err);
      }else {
         if(responseData.messages[0]['status'] === "0"){
            console.log("Messasge sent successfully.");
         }
         else {
            console.log(`Messasge failed with error: ${responseData.messages[0]['error-text']}`);
         }
      }
   }
   );
 });

//defined a port to start the server
const port = 5500;

const server = app.listen(port, () => console.log(`Server started ${port}`));
