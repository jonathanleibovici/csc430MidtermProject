const express = require("express");
const path = require("path");
var mysql = require("mysql");
const session = require("express-session");
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
});

connection.connect(function (err) {
	if (err) throw err;

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
			//connection.connect();//i need this
		});
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

app.listen(port, () => console.log("something is happining"));
