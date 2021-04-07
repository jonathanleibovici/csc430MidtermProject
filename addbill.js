const express = require("express");
const path = require("path");
var mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/", express.static(path.join(__dirname, "static")));

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

app.get("/bills.html", (req, res) => {
	// TODO: Fetch Bills From Database Using a SELECT Statement
	var sql = `SELECT * FROM test.dashboard;`;
	connection.query(sql, function (err, results) {
		if (err) throw err;
		//connection.end();
		res.render("results", { title: "Your Bills", bills: results || [] });
		// connection.connect();
	});
});

app.post("/", function (req, res) {
	//res.render('index');

	// FIXME: Vulnerable to SQL Injection
	var sql = `INSERT INTO test.dashboard (bill, companyName, dateDue, description, amount, link) values('${req.body.bill}', '${req.body.companyName}', '${req.body.date}', '${req.body.description}', ${req.body.amount}, '${req.body.link}');`;
	connection.query(sql, function (err) {
		if (err) throw err;
		res.redirect("/bills.html");
		// connection.end();
	});
	//connection.end();
});

app.listen(port, () => console.log("something is happining"));

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
