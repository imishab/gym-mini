var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;

module.exports = {



  ///////ADD content/////////////////////                                         
  adddiet: (diet, expertId, callback) => {
    if (!expertId || !objectId.isValid(expertId)) {
      return callback(null, new Error("Invalid or missing expertId"));
    }

    diet.expertId = objectId(expertId); // Associate diet with the expert

    db.get()
      .collection(collections.DIET_COLLECTION)
      .insertOne(diet)
      .then((data) => {
        callback(data.ops[0]._id); // Return the inserted diet ID
      })
      .catch((error) => {
        callback(null, error);
      });
  },

  addtips: (tips, expertId, callback) => {
    if (!expertId || !objectId.isValid(expertId)) {
      return callback(null, new Error("Invalid or missing expertId"));
    }

    tips.expertId = objectId(expertId); // Associate tips with the expert

    db.get()
      .collection(collections.TIPS_COLLECTION)
      .insertOne(tips)
      .then((data) => {
        callback(data.ops[0]._id); // Return the inserted diet ID
      })
      .catch((error) => {
        callback(null, error);
      });
  },



  ///////GET ALL diet/////////////////////                                            
  getAlldiets: (expertId) => {
    return new Promise(async (resolve, reject) => {
      let diets = await db
        .get()
        .collection(collections.DIET_COLLECTION)
        .find({ expertId: objectId(expertId) }) // Filter by expertId
        .toArray();
      resolve(diets);
    });
  },

  ///////ADD diet DETAILS/////////////////////                                            
  getdietDetails: (dietId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DIET_COLLECTION)
        .findOne({
          _id: objectId(dietId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE diet/////////////////////                                            
  deletediet: (dietId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DIET_COLLECTION)
        .removeOne({
          _id: objectId(dietId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE diet/////////////////////                                            
  updatediet: (dietId, dietDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DIET_COLLECTION)
        .updateOne(
          {
            _id: objectId(dietId)
          },
          {
            $set: {
              wname: dietDetails.wname,
              seat: dietDetails.seat,
              Price: dietDetails.Price,
              format: dietDetails.format,
              desc: dietDetails.desc,
              baddress: dietDetails.baddress,

            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL diet/////////////////////                                            
  deleteAlldiets: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.DIET_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  /////////////////////////

  ///////ADD content/////////////////////                                         
  addcontent: (content, expertId, callback) => {
    if (!expertId || !objectId.isValid(expertId)) {
      return callback(null, new Error("Invalid or missing expertId"));
    }

    content.Price = parseInt(content.Price);
    content.expertId = objectId(expertId); // Associate content with the expert

    db.get()
      .collection(collections.CONTENT_COLLECTION)
      .insertOne(content)
      .then((data) => {
        callback(data.ops[0]._id); // Return the inserted content ID
      })
      .catch((error) => {
        callback(null, error);
      });
  },


  ///////GET ALL content/////////////////////                                            
  getAllcontents: (expertId) => {
    return new Promise(async (resolve, reject) => {
      let contents = await db
        .get()
        .collection(collections.CONTENT_COLLECTION)
        .find({ expertId: objectId(expertId) }) // Filter by expertId
        .toArray();
      resolve(contents);
    });
  },

  ///////ADD content DETAILS/////////////////////                                            
  getcontentDetails: (contentId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CONTENT_COLLECTION)
        .findOne({
          _id: objectId(contentId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE content/////////////////////                                            
  deletecontent: (contentId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CONTENT_COLLECTION)
        .removeOne({
          _id: objectId(contentId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE content/////////////////////                                            
  updatecontent: (contentId, contentDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CONTENT_COLLECTION)
        .updateOne(
          {
            _id: objectId(contentId)
          },
          {
            $set: {
              wname: contentDetails.wname,
              seat: contentDetails.seat,
              Price: contentDetails.Price,
              format: contentDetails.format,
              desc: contentDetails.desc,
              baddress: contentDetails.baddress,

            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL content/////////////////////                                            
  deleteAllcontents: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CONTENT_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },


  addProduct: (product, callback) => {
    console.log(product);
    product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.PRODUCTS_COLLECTION)
      .insertOne(product)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  dosignup: (expertData) => {
    return new Promise(async (resolve, reject) => {
      try {
        expertData.Password = await bcrypt.hash(expertData.Password, 10);
        expertData.approved = false; // Set approved to false initially
        const data = await db.get().collection(collections.EXPERT_COLLECTION).insertOne(expertData);
        resolve(data.ops[0]);
      } catch (error) {
        reject(error);
      }
    });
  },


  doSignin: (expertData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let expert = await db
        .get()
        .collection(collections.EXPERT_COLLECTION)
        .findOne({ Email: expertData.Email });
      if (expert) {
        if (expert.rejected) {
          console.log("User is rejected");
          resolve({ status: "rejected" });
        } else {
          bcrypt.compare(expertData.Password, expert.Password).then((status) => {
            if (status) {
              if (expert.approved) {
                console.log("Login Success");
                response.expert = expert;
                response.status = true;
              } else {
                console.log("User not approved");
                response.status = "pending";
              }
              resolve(response);
            } else {
              console.log("Login Failed - Incorrect Password");
              resolve({ status: false });
            }
          });
        }
      } else {
        console.log("Login Failed - Email not found");
        resolve({ status: false });
      }
    });
  },


  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .removeOne({ _id: objectId(productId) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  updateProduct: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Category: productDetails.Category,
              Price: productDetails.Price,
              Description: productDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteAllProducts: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then(() => {
          resolve();
        });
    });
  },

  removeAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllOrders: (expertId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({ "expertId": objectId(expertId) }) // Filter by expert ID
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  changeStatus: (status, orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "status": status,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },

  cancelAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  searchProduct: (details) => {
    console.log(details);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .createIndex({ Name: "text" }).then(async () => {
          let result = await db
            .get()
            .collection(collections.PRODUCTS_COLLECTION)
            .find({
              $text: {
                $search: details.search,
              },
            })
            .toArray();
          resolve(result);
        })

    });
  },
};
