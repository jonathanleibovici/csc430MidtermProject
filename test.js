const express = require("express");
const path = require("path");
var mysql = require("mysql");
const session = require("express-session");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Vonage = require('@vonage/server-sdk');
const socketio = require('socket.io');
const from  ='18777022080';

//set app to express
const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: process.env.NODE_ENV === "production" ? true : false },
	})
);

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "test",
	port:3308
	//socketPath: "localhost/phpmyadmin/index.php?route=/sql&server=1&db=test&table=customerTable&pos=0"
});

connection.connect(function (err) {
	if (err){ throw err;}

	console.log("connected");
});

app.get("/addBill.html", (req, res) => {
	const sql = `SELECT user_id FROM sessions WHERE session_token='${req.sessionID}'`;

	connection.query(sql, (err, results) => {
		if (err) {
			console.log(err);
			throw err;
		}

		if (results.length < 1) {
			res.redirect("/");
			return;
		}
		

		console.log(results);
		res.sendFile(path.join(__dirname, "./static/addBill.html"));
	});
});

app.use("/", express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
	res.redirect("/login.html");
});
app.post("/something", (req, res) => {
	console.log("something");
	//res.send("something");
    if(req.body.yes){
	 var sqll = `UPDATE dashboard SET payedORnot = 'Yes' WHERE bill = ${req.body.yes}`
		connection.query(sqll, function (err, results) {
		 	if (err) throw err;
          
           
		 });

        }
        else{
            var sqll = `UPDATE dashboard SET payedORnot = 'NO' WHERE bill = ${req.body.no}`
            connection.query(sqll, function (err, results) {
                 if (err) throw err;
                
             });
        }
        res.redirect("/addbill.html");
       
});

app.get("/bills.html", (req, res) => {
	// TODO: Fetch Bills From Database Using a SELECT Statement
	const sql = `SELECT user_id FROM sessions WHERE session_token='${req.sessionID}'`;

	connection.query(sql, (err, results) => {
		if (err) {
			console.log(err);
			throw err;
		}

		if (results.length < 1) {
			res.redirect("/");
			return;
		}

		console.log(results);
		const customerID = results[0].user_id;
		if (!customerID) {
			console.log("here");
			res.redirect("/");
			return;
		}

		//then search the db for that user with that id
		var sql = `SELECT * FROM test.dashboard WHERE customerID = '${customerID}';`;
		connection.query(sql, function (err, results) {
			if (err) throw err;

			
			res.render("results", { title: "Your Bills", bills: results || [] });
			
		});
		//put tht function here
		// var sqll = `UPDATE dashboard SET payedORnot = yes WHERE bill = '${req.billID}`
		// connection.query(sqll, function (res,req) {
		// 	if (err) throw err;

			
			
		// });
		
	});
});

// Create a Table Called sessions that stores the session_token (String)
// and UserID (Integer foreign_key)

app.get("/logout", function (req, res) {
	const sql = `DELETE FROM sessions WHERE session_token='${req.sessionID}'`;
	connection.query(sql, (err) => {
		if(err) {
			console.log(err)
			throw err;
		}

		req.session.destroy();
		res.redirect('/login.html');
	})
})

// you use sessions stored in cookies

// when the user logs in you store their session in the database
// and use it to validate their identity on any following requests

// if there are no sessions matching in the database, the request
// gets redirected to login

app.post("/", function (req, res) {
	console.log("req.sessionID", req.sessionID);
	//make a new local var that has the same user id from the
	const sql = `SELECT user_id FROM sessions WHERE session_token='${req.sessionID}'`;

	connection.query(sql, (err, results) => {
		if (err) {
			console.log(err);
			throw err;
		}

		if (results.length < 1) {
			res.redirect("/");
			return;
		}

		console.log(results);
		const customerID = results[0].user_id;
		if (!customerID) {
			res.redirect("/");
			return;
		}
		// FIXME: Vulnerable to SQL Injection
		var sql = `INSERT INTO test.dashboard (bill, companyName, dateDue, description, amount, link,customerID) values('${req.body.bill}', '${req.body.companyName}', '${req.body.date}', '${req.body.description}', ${req.body.amount}, '${req.body.link}', ${customerID});`;
		//,'${req.body.customerID}'

		connection.query(sql, function (err) {
			if (err) throw err;
			//then redirect
			res.redirect("/bills.html");
		});
	});
});

app.post("/sign-up", function (req, res) {
	var sql = `INSERT INTO test.customerTable (firstname, lastname, email,password, phonenumber) values('${req.body.fname}', '${req.body.lname}', '${req.body["e-mail"]}','${req.body.password}', '${req.body.phonenum}');`;

	connection.query(sql, function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		const sqlCustomerId = `SELECT customerID FROM test.customertable WHERE email = '${req.body["e-mail"]}';`;
		connection.query(sqlCustomerId, (err, results) => {
			if (err) {
				console.log(err);
				throw err;
			}
			const customerID = results[0].customerID;

			const sql = `INSERT INTO sessions(user_id, session_token) VALUES (${customerID}, '${req.sessionID}')`;
			connection.query(sql, (err) => {
				if (err) {
					console.log(err);
					throw err;
				} else {
					res.redirect("/addBill.html");
				}
			});
		});
		// res.redirect("/addBill.html");
	});
});

app.post("/login", function (req, res) {
	//find the user with the emal and password match
	console.log(req.body);
	var sql = `select * from customerTable WHERE email = '${req.body.usname}' AND password = '${req.body.psw}'`;
	connection.query(sql, function (err, results, fields) {
		//if err with the sql err
		if (err) {
			console.log(err);
			throw err;
		} else {
			// else if the results.length ===0 then the user does not exist
			if (results.length === 0) {
				x = "error not found";
				return x;
			}

			console.log(results);
			//results 0 gets the customer id from the db
			const customerID = results[0].customerID;

			const sql = `INSERT INTO sessions(user_id, session_token) VALUES (${customerID}, '${req.sessionID}')`;
			connection.query(sql, (err) => {
				if (err) {
					console.log(err);
					throw err;
				} else {
					res.redirect("/addBill.html");
				}
			});
		}
	});
});
//call vonage constructor and give it the api key 
const vonage = new Vonage({
    apiKey: '9d1729d2',
    apiSecret: 'Xhh8SknHTUV3pBsI'
    //set debug mode to true
 },{debug: true});

//set the public folder where client side handles event listeners for form 
//app.set('view engine', 'pug');
//line below allows up to use .html files as views when rendering pages
app.engine('html', ejs.renderFile);

//define the folder destination being used with client side javascript
//we created folder public then inside public create folder js then create main.js file in js folder
app.use(express.static(__dirname + "public"));


//use this two lines of code for the body parsers which are now supported in express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//define a route to use 
app.get('/index.html',(req,res) => {
   res.render('index.html');
   //res.sendFile(path.join(__dirname, "./views/index.html"));
});


//catch the form submit
app.post('/index',(req,res) => {
    //request.body holds the form fields submitted
  const number = req.body.number;
  const text = req.body.text;


  //api communicating and sending text message 
  vonage.message.sendSms(18777022080,number, text,{ type: 'unicode'},
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


app.listen(port, () => console.log("something is happining"));










