var express = require('express');
var router = express.Router();
var modul = require('../modul/modul');

var session_store;
/* GET home page. */
router.get('/', function (req, res, next) {
	res.redirect('/stok/stokshoe');
});
router.get('/login', function (req, res, next) {
	res.render('main/login', { title: "Sign In | Shoe Dazzle" });
});

router.get('/register', function (req, res, next) {
	res.render('main/register', { title: "Sign Up | Shoe Dazzle" });
});

router.post("/register", function (req, res, next) {
	req.assert("nama", "Please fill the name").notEmpty();
	req.assert("email", "Please fill the email").notEmpty();
	req.assert("password", "Please fill the password").notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		v_nama = req.sanitize("nama").escape().trim();
		v_email = req.sanitize("email").escape().trim();
		v_password = req.sanitize("password").escape();

		var user = {
			nama: v_nama,
			email: v_email,
			password: v_password,
		};

		var insert_sql = "INSERT INTO user SET ?";
		req.getConnection(function (err, connection) {
			var query = connection.query(
				insert_sql,
				user,
				function (err, result) {
					if (err) {
						var errors_detail = ("Error Insert : %s ", err);
						req.flash("msg_error", errors_detail);
						res.render("main/register", {
							nama: req.param("nama"),
							address: req.param("address"),
							email: req.param("email"),
							password: req.param("password"),
							session_store: req.session,
						});
					} else {
						req.flash("msg_info", "Create User success");
						res.redirect("/login");
					}
				}
			);
		});
	} else {
		console.log(errors);
		errors_detail = "<p>Sorry there are error</p><ul>";
		for (i in errors) {
			error = errors[i];
			errors_detail += "<li>" + error.msg + "</li>";
		}
		errors_detail += "</ul>";
		req.flash("msg_error", errors_detail);
		res.render("main/register", {
			nama: req.param("nama"),
			address: req.param("address"),
			session_store: req.session,
		});
	}
});

router.post('/login', function (req, res, next) {
	session_store = req.session;
	req.assert('txtEmail', 'Please fill the Username').notEmpty();
	req.assert('txtEmail', 'Email not valid').isEmail();
	req.assert('txtPassword', 'Please fill the Password').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {
		req.getConnection(function (err, connection) {
			v_pass = req.sanitize('txtPassword').escape().trim();
			v_email = req.sanitize('txtEmail').escape().trim();

			var query = connection.query('select * from user where email="' + v_email + '" and password="' + v_pass + '"', function (err, rows) {
				if (err) {

					var errornya = ("Error Selecting : %s ", err.code);
					console.log(err.code);
					req.flash('msg_error', errornya);
					res.redirect('/login');
				} else {
					if (rows.length <= 0) {

						req.flash('msg_error', "Wrong email address or password. Try again.");
						res.redirect('/login');
					}
					else {
						session_store.is_login = true;
						res.redirect('/stok/stokshoe');
					}
				}

			});
		});
	}
	else {
		errors_detail = "<p>Sory there are error</p><ul>";
		for (i in errors) {
			error = errors[i];
			errors_detail += '<li>' + error.msg + '</li>';
		}
		errors_detail += "</ul>";
		console.log(errors_detail);
		req.flash('msg_error', errors_detail);
		res.redirect('/login');
	}
});
router.get('/logout', function (req, res) {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/login');
		}
	});
});
module.exports = router;
