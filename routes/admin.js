var express = require("express");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();
var db = require("../config/connection");
var collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectID;

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/home", { admin: true, products, layout: "admin-layout", administator });
  });
});


///////ALL dataset/////////////////////                                         
router.get("/all-datasets", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAlldatasets().then((datasets) => {
    res.render("admin/dataset/all-datasets", { admin: true, layout: "admin-layout", datasets, administator });
  });
});

///////ADD dataset/////////////////////                                         
router.get("/add-dataset", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/dataset/add-dataset", { admin: true, layout: "admin-layout", administator });
});

///////ADD dataset/////////////////////                                         
router.post("/add-dataset", function (req, res) {
  adminHelper.adddataset(req.body, (id) => {
    res.redirect("/admin/dataset/all-datasets");

  })
});

///////EDIT dataset/////////////////////                                         
router.get("/edit-dataset/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let datasetId = req.params.id;
  let dataset = await adminHelper.getdatasetDetails(datasetId);
  console.log(dataset);
  res.render("admin/dataset/edit-dataset", { admin: true, layout: "admin-layout", dataset, administator });
});

///////EDIT dataset/////////////////////                                         
router.post("/edit-dataset/:id", verifySignedIn, function (req, res) {
  let datasetId = req.params.id;
  adminHelper.updatedataset(datasetId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/dataset-images/" + datasetId + ".png");
      }
    }
    res.redirect("/admin/dataset/all-datasets");
  });
});

///////DELETE dataset/////////////////////                                         
router.get("/delete-dataset/:id", verifySignedIn, function (req, res) {
  let datasetId = req.params.id;
  adminHelper.deletedataset(datasetId).then((response) => {
    res.redirect("/admin/dataset/all-datasets");
  });
});

///////DELETE ALL dataset/////////////////////                                         
router.get("/delete-all-datasets", verifySignedIn, function (req, res) {
  adminHelper.deleteAlldatasets().then(() => {
    res.redirect("/admin/dataset/all-datasets");
  });
});



///////ALL expert/////////////////////                                         
router.get("/all-experts", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllexperts().then((experts) => {
    res.render("admin/expert/all-experts", { admin: true, layout: "admin-layout", experts, administator });
  });
});

router.post("/approve-expert/:id", verifySignedIn, async function (req, res) {
  await db.get().collection(collections.EXPERT_COLLECTION).updateOne(
    { _id: ObjectId(req.params.id) },
    { $set: { approved: true } }
  );
  res.redirect("/admin/all-experts");
});

router.post("/reject-expert/:id", function (req, res) {
  const expertId = req.params.id;
  db.get()
    .collection(collections.EXPERT_COLLECTION)
    .updateOne({ _id: ObjectId(expertId) }, { $set: { approved: false, rejected: true } })
    .then(() => {
      res.redirect("/admin/all-experts");
    })
    .catch((err) => {
      console.error(err);
      res.redirect("/admin/all-experts");
    });
});


router.post("/delete-expert/:id", verifySignedIn, async function (req, res) {
  await db.get().collection(collections.EXPERT_COLLECTION).deleteOne({ _id: ObjectId(req.params.id) });
  res.redirect("/admin/all-experts");
});

///////ADD expert/////////////////////                                         
router.get("/add-expert", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/expert/add-expert", { admin: true, layout: "admin-layout", administator });
});

///////ADD expert/////////////////////                                         
router.post("/add-expert", function (req, res) {
  adminHelper.addexpert(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/expert-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin/expert/all-experts");
      } else {
        console.log(err);
      }
    });
  });
});

///////EDIT expert/////////////////////                                         
router.get("/edit-expert/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let expertId = req.params.id;
  let expert = await adminHelper.getexpertDetails(expertId);
  console.log(expert);
  res.render("admin/expert/edit-expert", { admin: true, layout: "admin-layout", expert, administator });
});

///////EDIT expert/////////////////////                                         
router.post("/edit-expert/:id", verifySignedIn, function (req, res) {
  let expertId = req.params.id;
  adminHelper.updateexpert(expertId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/expert-images/" + expertId + ".png");
      }
    }
    res.redirect("/admin/expert/all-experts");
  });
});

///////DELETE expert/////////////////////                                         
// router.get("/delete-expert/:id", verifySignedIn, function (req, res) {
//   let expertId = req.params.id;
//   adminHelper.deleteexpert(expertId).then((response) => {
//     res.redirect("/admin/all-experts");
//   });
// });

///////DELETE ALL expert/////////////////////                                         
router.get("/delete-all-experts", verifySignedIn, function (req, res) {
  adminHelper.deleteAllexperts().then(() => {
    res.redirect("/admin/expert/all-experts");
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/all-products", { admin: true, layout: "admin-layout", products, administator });
  });
});

router.get("/signup", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signup", {
      admin: true, layout: "admin-empty",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", function (req, res) {
  adminHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/admin/signup");
    } else {
      req.session.signedInAdmin = true;
      req.session.admin = response;
      res.redirect("/admin");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signin", {
      admin: true, layout: "admin-empty",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  adminHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInAdmin = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/admin/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInAdmin = false;
  req.session.admin = null;
  res.redirect("/admin");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-product", { admin: true, layout: "admin-layout", administator });
});

router.post("/add-product", function (req, res) {
  adminHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let productId = req.params.id;
  let product = await adminHelper.getProductDetails(productId);
  console.log(product);
  res.render("admin/edit-product", { admin: true, layout: "admin-layout", product, administator });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  adminHelper.deleteAllProducts().then(() => {
    res.redirect("/admin/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/users/all-users", { admin: true, layout: "admin-layout", administator, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  adminHelper.removeAllUsers().then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let orders = await adminHelper.getAllOrders();
  res.render("admin/all-orders", {
    admin: true, layout: "admin-layout",
    administator,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let administator = req.session.admin;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("admin/order-products", {
      admin: true, layout: "admin-layout",
      administator,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  adminHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  adminHelper.cancelOrder(orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  adminHelper.cancelAllOrders().then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.searchProduct(req.body).then((response) => {
    res.render("admin/search-result", { admin: true, layout: "admin-layout", administator, response });
  });
});


module.exports = router;
