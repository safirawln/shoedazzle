var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;


router.get("/stokshoe", authentication_mdl.is_login, function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM stok",
        function (err, rows) {
          if (err) var errornya = ("Error Selecting : %s ", err);
          req.flash("msg_error", errornya);
          res.render("stok/list", {
            title: "Data Sepatu",
            data: rows,
            session_store: req.session,
          });
        }
      );
      //console.log(query.sql);
    });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var stok = {
        id: req.params.id,
      };

      var delete_sql = "delete from stok where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          stok,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/stok");
            } else {
              req.flash("msg_info", "Delete stok Success");
              res.redirect("/stok/stokshoe");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM stok where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/stok");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "stok can't be find!");
              res.redirect("/stok");
            } else {
              console.log(rows);
              res.render("stok/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("name", "Please fill the name").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_name = req.sanitize("name").escape().trim();
      v_stok = req.sanitize("stok").escape().trim();
      v_harga = req.sanitize("harga").escape();
      v_deskripsi = req.sanitize("deskripsi").escape();
    	v_merk = req.sanitize("merk").escape();

      if (!req.files) {
        var stok = {
          name: v_name,
          harga: v_harga,
          stok: v_stok,
          deskripsi: v_deskripsi,
          merk: v_merk,
        };
      }else{
        var file = req.files.gambar;
        var gambar = file.name;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + gambar);

      var stok = {
        name: v_name,
        harga: v_harga,
        stok: v_stok,
        deskripsi: v_deskripsi,
        merk: v_merk,
        gambar: gambar,
      };
    }

      var update_sql = "update stok SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          stok,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("stok/edit", {
                name: req.param("name"),
                harga: req.param("harga"),
                stok: req.param("stok"),
                deskripsi: req.param("deskripsi"),
			          merk: req.param("merk"),
              });
            } else {
              req.flash("msg_info", "Update stok success");
              res.redirect("/stok/stokshoe");
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/stok/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("name", "Please fill the name").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_name = req.sanitize("name").escape().trim();
    v_stok = req.sanitize("stok").escape().trim();
    v_harga = req.sanitize("harga").escape();
    v_deskripsi = req.sanitize("deskripsi").escape();
	  v_merk = req.sanitize("merk").escape();

    var file = req.files.gambar;
    var gambar = file.name;
    file.mimetype == "image/jpeg";
    file.mv("public/images/upload/" + gambar);

    var stok = {
      name: v_name,
      harga: v_harga,
      stok: v_stok,
      deskripsi: v_deskripsi,
		  merk: v_merk,
      gambar: gambar,
    };

    var insert_sql = "INSERT INTO stok SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        stok,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("stok/add-stok", {
              name: req.param("name"),
              harga: req.param("harga"),
              stok: req.param("stok"),
              deskripsi: req.param("deskripsi"),
	            merk: req.param("merk"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create stok success");
            res.redirect("/stok/stokshoe");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("stok/add-stok", {
      name: req.param("name"),
      stok: req.param("stok"),
      harga: req.param("harga"),
      deskripsi: req.param("deskripsi"),
			merk: req.param("merk"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("stok/add-stok", {
    title: "Add New stok",
    name: "",
    stok: "",
    harga: "",
    deskripsi: "",
    merk: "",
    session_store: req.session,
  });
});

module.exports = router;