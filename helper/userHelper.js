var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;
const Razorpay = require("razorpay");
const ObjectId = require('mongodb').ObjectId; // Required to convert string to ObjectId


var instance = new Razorpay({
  key_id: "rzp_test_8NokNgt8cA3Hdv",
  key_secret: "xPzG53EXxT8PKr34qT7CTFm9",
});

module.exports = {

  getAllTips: () => {
    return new Promise(async (resolve, reject) => {
      let tips = await db
        .get()
        .collection(collections.TIPS_COLLECTION)
        .find()
        .toArray();
      resolve(tips);
    });
  },


  getAllDiets: () => {
    return new Promise(async (resolve, reject) => {
      let diets = await db
        .get()
        .collection(collections.DIET_COLLECTION)
        .find()
        .toArray();
      resolve(diets);
    });
  },

  ///////GET ALL diet/////////////////////     

  getAlldiets: () => {
    return new Promise(async (resolve, reject) => {
      let diets = await db
        .get()
        .collection(collections.DIET_COLLECTION)
        .find()
        .toArray();
      resolve(diets);
    });
  },

  getDietById: async (dietId) => {
    try {
      const diet = await db.get()
        .collection(collections.DIET_COLLECTION)
        .findOne({ _id: ObjectId(dietId) });

      if (diet) {
        // Fetch content using the videoId from the diet
        const content = await db.get()
          .collection(collections.CONTENT_COLLECTION) // Ensure you replace this with your actual content collection name
          .findOne({ _id: ObjectId(diet.videoId.$oid) });

        return { diet, content }; // Return both diet and content
      }

      return null; // In case diet is not found
    } catch (error) {
      throw error; // Throw the error for the calling function to handle
    }
  },


  getContentById: (videoId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const content = await db.get()
          .collection(collections.CONTENT_COLLECTION) // Replace with your content collection name
          .findOne({ _id: ObjectId(videoId) }); // Fetch by videoId
        resolve(content);
      } catch (error) {
        reject(error);
      }
    });
  },

  // getAlldiets: (expertId) => {
  //   return new Promise(async (resolve, reject) => {
  //     let diets = await db
  //       .get()
  //       .collection(collections.DIET_COLLECTION)
  //       .find({ expertId: objectId(expertId) }) // Filter by expertId
  //       .toArray();
  //     resolve(diets);
  //   });
  // },

  /////// diet DETAILS/////////////////////                                            
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

  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collections.USERS_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },

  doSignin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },

  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ _id: objectId(userId) })
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  updateUserProfile: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: {
              Fname: userDetails.Fname,
              Lname: userDetails.Lname,
              Email: userDetails.Email,
              Phone: userDetails.Phone,
              Address: userDetails.Address,
              District: userDetails.District,
              Pincode: userDetails.Pincode,
            },
          }
        )
        .then((response) => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  },


  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
            },
          },
        ])
        .toArray();
      console.log(total[0].total);
      resolve(total[0].total);
    });
  },




  getDietDetails: (dietId) => {
    return new Promise((resolve, reject) => {
      if (!ObjectId.isValid(dietId)) {
        reject(new Error('Invalid diet ID format'));
        return;
      }

      db.get()
        .collection(collections.DIET_COLLECTION)
        .findOne({ _id: ObjectId(dietId) })
        .then((diet) => {
          if (!diet) {
            reject(new Error('Diet not found'));
          } else {
            // Assuming the diet has a expertId field
            resolve(diet);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },




  placeOrder: (order, diet, total, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(order, diet, total);
        let status = order["payment-method"] === "COD" ? "placed" : "pending";

        let orderObject = {
          deliveryDetails: {
            Fname: order.Fname,
            Lname: order.Lname,
            Email: order.Email,
            Phone: order.Phone,
            Address: order.Address,
            District: order.District,
            State: order.State,
            Pincode: order.Pincode,
            selecteddate: order.selecteddate,
          },
          userId: objectId(order.userId),
          user: user,
          paymentMethod: order["payment-method"],
          diet: diet,
          totalAmount: total,
          status: status,
          date: new Date(),
          expertId: diet.expertId, // Add this line to store the expert's ID
        };

        const response = await db.get()
          .collection(collections.ORDER_COLLECTION)
          .insertOne(orderObject);

        resolve(response.ops[0]._id);
      } catch (error) {
        console.error("Error placing order:", error);
        reject(error);
      }
    });
  },


  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .find({ userId: ObjectId(userId) }) // Use 'userId' directly, not inside 'orderObject'
          .toArray();

        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },

  getOrderDiets: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let diets = await db
          .get()
          .collection(collections.ORDER_COLLECTION)
          .aggregate([
            {
              $match: { _id: objectId(orderId) }, // Match the order by its ID
            },
            {
              $project: {
                // Include diet, user, and other relevant fields
                diet: 1,
                user: 1,
                paymentMethod: 1,
                totalAmount: 1,
                status: 1,
                date: 1,
                deliveryDetails: 1, // Add deliveryDetails to the projection

              },
            },
          ])
          .toArray();

        resolve(diets[0]); // Fetch the first (and likely only) order matching this ID
      } catch (error) {
        reject(error);
      }
    });
  },

  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        console.log("New Order : ", order);
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "xPzG53EXxT8PKr34qT7CTFm9");

      hmac.update(
        details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
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
