var express = require("express");
var expertHelper = require("../helper/expertHelper");
var adminHelper = require("../helper/adminHelper");

var fs = require("fs");
const userHelper = require("../helper/userHelper");
var router = express.Router();
var db = require("../config/connection");
var collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectID;


const verifySignedIn = (req, res, next) => {
  if (req.session.signedInexpert) {
    next();
  } else {
    res.redirect("/expert/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let expert = req.session.expert;
  res.render("expert/home", { expert: true, layout: "layout", expert });
});


///////ADD content/////////////////////                                         
router.get("/add-tips", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;
  expertHelper.getAllOrders(req.session.expert._id).then((orders) => {
    res.render("expert/add-tips", { admin: true, layout: "layout", expert, orders });
  })
});

///////ADD tips/////////////////////                                         
router.post("/add-tips", async function (req, res) {
  // Ensure the expert is signed in and their ID is available
  if (req.session.signedInexpert && req.session.expert && req.session.expert._id) {
    const expertId = req.session.expert._id; // Get the expert's ID from the session

    // Convert userId in req.body to ObjectId
    if (req.body.userId) {
      req.body.userId = ObjectId(req.body.userId);
    }

    // Pass the expertId to the addtips function
    expertHelper.addtips(req.body, expertId, (tipsId, error) => {
      if (error) {
        console.log("Error adding tips:", error);
        res.status(500).send("Failed to add tips");
      } else {
        res.redirect("/expert");
      }
    });
  } else {
    // If the expert is not signed in, redirect to the sign-in page
    res.redirect("/expert/signin");
  }
});



////////////////////PROFILE////////////////////////////////////
router.get("/profile", async function (req, res, next) {
  let expert = req.session.expert;
  res.render("expert/profile", { admin: true, layout: "layout", expert });
});


///////ALL content/////////////////////                                         
router.get("/all-contents", verifySignedIn, function (req, res) {
  let expert = req.session.expert;
  expertHelper.getAllcontents(req.session.expert._id).then((contents) => {
    res.render("expert/all-contents", { admin: true, layout: "layout", contents, expert });
  });
});

///////ADD content/////////////////////                                         
router.get("/add-content", verifySignedIn, function (req, res) {
  let expert = req.session.expert;
  res.render("expert/add-content", { admin: true, layout: "layout", expert });
});

///////ADD content/////////////////////                                         
router.post("/add-content", function (req, res) {
  // Ensure the expert is signed in and their ID is available
  if (req.session.signedInexpert && req.session.expert && req.session.expert._id) {
    const expertId = req.session.expert._id; // Get the expert's ID from the session

    // Pass the expertId to the addcontent function
    expertHelper.addcontent(req.body, expertId, (contentId, error) => {
      if (error) {
        console.log("Error adding content:", error);
        res.status(500).send("Failed to add content");
      } else {
        let image = req.files.Image;
        image.mv("./public/images/content-images/" + contentId + ".png", (err) => {
          if (!err) {
            res.redirect("/expert/all-contents");
          } else {
            console.log("Error saving content image:", err);
            res.status(500).send("Failed to save content image");
          }
        });
      }
    });
  } else {
    // If the expert is not signed in, redirect to the sign-in page
    res.redirect("/expert/signin");
  }
});


///////EDIT content/////////////////////                                         
router.get("/edit-content/:id", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;
  let contentId = req.params.id;
  let content = await expertHelper.getcontentDetails(contentId);
  console.log(content);
  res.render("expert/edit-content", { admin: true, layout: "layout", content, expert });
});

///////EDIT content/////////////////////                                         
router.post("/edit-content/:id", verifySignedIn, function (req, res) {
  let contentId = req.params.id;
  expertHelper.updatecontent(contentId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/content-images/" + contentId + ".png");
      }
    }
    res.redirect("/expert/all-contents");
  });
});

///////DELETE content/////////////////////                                         
router.get("/delete-content/:id", verifySignedIn, function (req, res) {
  let contentId = req.params.id;
  expertHelper.deletecontent(contentId).then((response) => {
    fs.unlinkSync("./public/images/content-images/" + contentId + ".png");
    res.redirect("/expert/all-contents");
  });
});

///////DELETE ALL content/////////////////////                                         
router.get("/delete-all-contents", verifySignedIn, function (req, res) {
  expertHelper.deleteAllcontents().then(() => {
    res.redirect("/expert/all-contents");
  });
});


///////ALL diet/////////////////////                                         
router.get("/all-diets", verifySignedIn, function (req, res) {
  let expert = req.session.expert;
  expertHelper.getAlldiets(req.session.expert._id).then((diets) => {
    res.render("expert/all-diets", { admin: true, layout: "layout", diets, expert });
  });
});

///////ADD diet/////////////////////                                         
router.get("/add-diet", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;
  let datasets = await adminHelper.getAlldatasets(req.session.expert._id);
  let contents = await adminHelper.getAllcontents(req.session.expert._id);

  res.render("expert/add-diet", { admin: true, layout: "layout", expert, datasets, contents });

});


// Route to get inventory details by ID
router.get("/get-content/:id", (req, res) => {
  const contentId = req.params.id;

  adminHelper.getContentById(contentId)
    .then((content) => {
      res.json(content); // Send content details as JSON
    })
    .catch((error) => {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Route to get inventory details by ID
router.get("/get-dataset/:id", (req, res) => {
  const datasetId = req.params.id;

  adminHelper.getDatasetById(datasetId)
    .then((dataset) => {
      res.json(dataset); // Send dataset details as JSON
    })
    .catch((error) => {
      console.error("Error fetching dataset:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});


///////ADD diet/////////////////////                                         
router.post("/add-diet", function (req, res) {
  // Ensure the expert is signed in and their ID is available
  if (req.session.signedInexpert && req.session.expert && req.session.expert._id) {
    const expertId = req.session.expert._id; // Get the expert's ID from the session

    // Convert the video ID from string to ObjectId
    const videoId = ObjectId(req.body.videoId); // Assuming req.body.videoId contains the ID of the content

    // Pass the expertId and videoId to the adddiet function
    expertHelper.adddiet({ ...req.body, videoId }, expertId, (dietId, error) => {
      if (error) {
        console.log("Error adding diet:", error);
        res.status(500).send("Failed to add diet");
      } else {
        let image = req.files.Image;
        image.mv("./public/images/diet-images/" + dietId + ".png", (err) => {
          if (!err) {
            res.redirect("/expert/all-diets");
          } else {
            console.log("Error saving diet image:", err);
            res.status(500).send("Failed to save diet image");
          }
        });
      }
    });
  } else {
    // If the expert is not signed in, redirect to the sign-in page
    res.redirect("/expert/signin");
  }
});


///////EDIT diet/////////////////////                                         
router.get("/edit-diet/:id", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;
  let dietId = req.params.id;
  let diet = await expertHelper.getdietDetails(dietId);
  console.log(diet);
  res.render("expert/edit-diet", { admin: true, layout: "layout", diet, expert });
});

///////EDIT diet/////////////////////                                         
router.post("/edit-diet/:id", verifySignedIn, function (req, res) {
  let dietId = req.params.id;
  expertHelper.updatediet(dietId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/diet-images/" + dietId + ".png");
      }
    }
    res.redirect("/expert/all-diets");
  });
});

///////DELETE diet/////////////////////                                         
router.get("/delete-diet/:id", verifySignedIn, function (req, res) {
  let dietId = req.params.id;
  expertHelper.deletediet(dietId).then((response) => {
    fs.unlinkSync("./public/images/diet-images/" + dietId + ".png");
    res.redirect("/expert/all-diets");
  });
});

///////DELETE ALL diet/////////////////////                                         
router.get("/delete-all-diets", verifySignedIn, function (req, res) {
  expertHelper.deleteAlldiets().then(() => {
    res.redirect("/expert/all-diets");
  });
});


router.get("/all-users", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;

  // Ensure you have the expert's ID available
  let expertId = expert._id; // Adjust based on how expert ID is stored in session

  // Pass expertId to getAllOrders
  let orders = await expertHelper.getAllOrders(expertId);

  res.render("expert/all-users", {
    expert: true,
    layout: "layout",
    orders,
    expert
  });
});

router.get("/pending-approval", function (req, res) {
  if (!req.session.signedInexpert || req.session.expert.approved) {
    res.redirect("/expert");
  } else {
    res.render("expert/pending-approval", {
      expert: true, layout: "empty",
    });
  }
});


router.get("/signup", function (req, res) {
  if (req.session.signedInexpert) {
    res.redirect("/expert");
  } else {
    res.render("expert/signup", {
      expert: true, layout: "empty",
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", async function (req, res) {
  const { Name, Email, Phone, Address, City, Pincode, Password } = req.body;
  let errors = {};

  // Field validations
  if (!Name) errors.Name = "Please enter your name.";
  if (!Email) errors.email = "Please enter your email.";
  if (!Phone) errors.phone = "Please enter your phone number.";
  if (!Address) errors.address = "Please enter your address.";
  if (!City) errors.city = "Please enter your city.";
  if (!Pincode) errors.pincode = "Please enter your pincode.";
  if (!Password) errors.password = "Please enter a password.";

  // Check if email or company name already exists
  const existingEmail = await db.get()
    .collection(collections.EXPERT_COLLECTION)
    .findOne({ Email });
  if (existingEmail) errors.email = "This email is already registered.";

  const existingName = await db.get()
    .collection(collections.EXPERT_COLLECTION)
    .findOne({ Name });
  if (existingName) errors.Name = "This company name is already registered.";

  // Validate Pincode and Phone
  if (!/^\d{6}$/.test(Pincode)) errors.pincode = "Pincode must be exactly 6 digits.";
  if (!/^\d{10}$/.test(Phone)) errors.phone = "Phone number must be exactly 10 digits.";
  const existingPhone = await db.get()
    .collection(collections.EXPERT_COLLECTION)
    .findOne({ Phone });
  if (existingPhone) errors.phone = "This phone number is already registered.";

  // If there are validation errors, re-render the form
  if (Object.keys(errors).length > 0) {
    return res.render("expert/signup", {
      expert: true,
      layout: 'empty',
      errors,
      Name,
      Email,
      Phone,
      Address,
      City,
      Pincode,
      Password
    });
  }

  expertHelper.dosignup(req.body).then((response) => {
    if (!response) {
      req.session.signUpErr = "Invalid Admin Code";
      return res.redirect("/expert/signup");
    }

    // Extract the id properly, assuming it's part of an object (like MongoDB ObjectId)
    const id = response._id ? response._id.toString() : response.toString();

    // Ensure the images directory exists
    const imageDir = "./public/images/expert-images/";
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Handle image upload
    if (req.files && req.files.Image) {
      let image = req.files.Image;
      let imagePath = imageDir + id + ".png";  // Use the extracted id here

      console.log("Saving image to:", imagePath);  // Log the correct image path

      image.mv(imagePath, (err) => {
        if (!err) {
          // On successful image upload, redirect to pending approval
          req.session.signedInexpert = true;
          req.session.expert = response;
          res.redirect("/expert/pending-approval");
        } else {
          console.log("Error saving image:", err);  // Log any errors
          res.status(500).send("Error uploading image");
        }
      });
    } else {
      // No image uploaded, proceed without it
      req.session.signedInexpert = true;
      req.session.expert = response;
      res.redirect("/expert/pending-approval");
    }
  }).catch((err) => {
    console.log("Error during signup:", err);
    res.status(500).send("Error during signup");
  });
}),


  router.get("/signin", function (req, res) {
    if (req.session.signedInexpert) {
      res.redirect("/expert");
    } else {
      res.render("expert/signin", {
        expert: true, layout: "empty",
        signInErr: req.session.signInErr,
      });
      req.session.signInErr = null;
    }
  });

router.post("/signin", function (req, res) {
  const { Email, Password } = req.body;

  // Validate Email and Password
  if (!Email || !Password) {
    req.session.signInErr = "Please fill all fields.";
    return res.redirect("/expert/signin");
  }

  expertHelper.doSignin(req.body)
    .then((response) => {
      if (response.status === true) {
        req.session.signedInexpert = true;
        req.session.expert = response.expert;
        res.redirect("/expert");
      } else if (response.status === "pending") {
        req.session.signInErr = "This user is not approved by admin, please wait.";
        res.redirect("/expert/signin");
      } else if (response.status === "rejected") {
        req.session.signInErr = "This user is rejected by admin.";
        res.redirect("/expert/signin");
      } else {
        req.session.signInErr = "Invalid Email/Password";
        res.redirect("/expert/signin");
      }
    })
    .catch((error) => {
      console.error(error);
      req.session.signInErr = "An error occurred. Please try again.";
      res.redirect("/expert/signin");
    });
});




router.get("/signout", function (req, res) {
  req.session.signedInexpert = false;
  req.session.expert = null;
  res.redirect("/expert");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let expert = req.session.expert;
  res.render("expert/add-product", { expert: true, layout: "layout", content });
});

router.post("/add-product", function (req, res) {
  expertHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/expert/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;
  let productId = req.params.id;
  let product = await expertHelper.getProductDetails(productId);
  console.log(product);
  res.render("expert/edit-product", { expert: true, layout: "layout", product, content });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  expertHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/expert/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  expertHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/expert/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  expertHelper.deleteAllProducts().then(() => {
    res.redirect("/expert/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let expert = req.session.expert;
  expertHelper.getAllUsers().then((users) => {
    res.render("expert/users/all-users", { expert: true, layout: "layout", content, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  expertHelper.removeUser(userId).then(() => {
    res.redirect("/expert/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  expertHelper.removeAllUsers().then(() => {
    res.redirect("/expert/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let expert = req.session.expert;

  // Ensure you have the expert's ID available
  let expertId = expert._id; // Adjust based on how expert ID is stored in session

  // Pass expertId to getAllOrders
  let orders = await expertHelper.getAllOrders(expertId);

  res.render("expert/all-orders", {
    expert: true,
    layout: "layout",
    orders,
    expert
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let expert = req.session.expert;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("expert/order-products", {
      expert: true, layout: "layout",
      content,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  expertHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/expert/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  expertHelper.cancelOrder(orderId).then(() => {
    res.redirect("/expert/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  expertHelper.cancelAllOrders().then(() => {
    res.redirect("/expert/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let expert = req.session.expert;
  expertHelper.searchProduct(req.body).then((response) => {
    res.render("expert/search-result", { expert: true, layout: "layout", content, response });
  });
});


module.exports = router;
