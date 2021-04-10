const express = require("express");
const path = require("path");
var mysql = require("mysql");
const bodyParser = require("body-parser");
//const session = require('express-session');
//var cookieParser = require('cookie-parser');
const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/", express.static(path.join(__dirname, "static")));
//app.use(cookieParser());

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "test",
});
connection.connect(function (err) {
	if (err) throw err;

	console.log("connected");
});


// app.use(session({
// 	secret:'keyboard cat',
// 	cookie: {maxAge: 3000},
// 	saveUninitialized: false
// }));



app.get("/bills.html", (req, res) => {
	// TODO: Fetch Bills From Database Using a SELECT Statement
	var sql = `SELECT * FROM test.dashboard d JOIN test.customerTable c ON
    d.customerID = c.customerID where c.customerID;`;
	connection.query(sql, function (err, results) {
		if (err) throw err;
		//connection.end();
		res.render("results", { title: "Your Bills", bills: results || [] });
		//connection.connect();//i need this
	});
	//connection.end();
});

app.post("/", function (req, res) {
	//res.render('index');

	// FIXME: Vulnerable to SQL Injection
	var sql = `INSERT INTO test.dashboard (bill, companyName, dateDue, description, amount, link) values('${req.body.bill}', '${req.body.companyName}', '${req.body.date}', '${req.body.description}', ${req.body.amount}, '${req.body.link}');`;
	connection.query(sql, function (err) {
		if (err) throw err;
		//console.log(req.cookies);
		res.redirect("/bills.html");
		// connection.end();
	});
	//connection.end();
});
app.post("/sign-up", function (req, res) {
	//var sql = `Insert into test.customerTable ()`

	var sql = `INSERT INTO test.customerTable (firstname, lastname, email,password, phonenumber) values('${req.body.fname}', '${req.body.lname}', '${req.body["e-mail"]}','${req.body.password}', '${req.body.phonenum}');`;

	connection.query(sql, function (err) {
		if (err) {
			console.log(err);
			throw err;
		}
		//res.cookie('session_id','123456').redirect("/addBill.html");
		
		res.redirect("/addBill.html");

	});
});
// function validateCookie(req,res,next){
// 	const {cookies} = req;
// 	console.log(cookies);
// 	next();
// }
// app.get("/sign-up",validateCookie,(res,req)=>{
// 	res.cookies('session_id','123456').send('cookie set');
// 	console.log("cookie",document.cookie);
// 	res.status(200).json({msg: 'Logged in'});
	
// });
app.post("/login", function (req, res) {
	//find the user with the emal and password match
	console.log(req.body);
	//console.log(req.sessionID);
	//var sql = `select email,password from customerTable WHERE 'email' = '${req.body.usname}' AND 'password' = '${req.body.psw}'`;
	var sql = `select * from customerTable WHERE email = '${req.body.usname}' AND password = '${req.body.psw}'`;
	connection.query(sql, function (err,results,fields) {
		//if err with the sql err
		if (err) {
			console.log(err);
			throw err;
		}
		
		else{
			// else if the results.length ===0 then the user does not exist
			if(results.length === 0){
				x = "error not found"
				return x;
			}
			// else if(req.session.authenticated){
			// 	res.json(req.session);
			// }
		//document.cookie ="customerID="+id+";";
		//req.session.authenticated = true;
		//req.session.user = {
		// console.log(results);
		// res.redirect("/addBill.html");
		// console.log("login runing");
		//usname,psw
		//};
		//res.json(req.session);
		console.log(results);
		res.redirect("/addBill.html");
		
		// res.redirect("/addBill.html");
		// console.log("login runing");
		// console.log("login runing");
		}
	});
});

app.listen(port, () => console.log("something is happining"));
/*
if ($stmt = mysqli_prepare($connection, $query = "INSERT INTO Users (FirstName, LastName, Email, DateofBirth, Username, Password) VALUES (?,?,?,?,?,?)")) {

    mysqli_stmt_bind_param($stmt, 'ssssss', $firstname,$lastname,$email,$dob,$user,$pass);

    mysqli_stmt_execute($stmt) or die('Error when inserting:'.mysqli_error($connection));
 }else{
die('Error when preparing '.mysqli_error($connection));


ALTER TABLE `customerTable` DROP FOREIGN KEY `billid`;
ALTER TABLE `customerTable` DROP COLUMN `billid`;
}
*/

// const pool = require("./database.js");
// //import pool from "./database.js"

// pool.query(
// 	`INSERT INTO test (bill, companyName,dateDue,description,amount,link)
//     VALUES (1,'vz',10/21/29,'lol',98,'lolkk')`,
// 	(err, result, field) => {
// 		if (err) {
// 			return console.log(err);
// 		}
// 		return console.log(result);
// 	}
// );
// to save the cookie

// login problem figure the output of the wuery 
// then if the output is empty no useres exist
//cookie get the output from the output get the users id save the id as a cookie