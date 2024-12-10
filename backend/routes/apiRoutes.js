// backend/routes/apiRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../controllers/jwtToken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const database = require("../database/database");
const { register } = require("../controllers/signupController");
const loginController = require("../controllers/loginController");
const { checkUserExists } = require("../controllers/authController");
// const { sendVerificationCode, checkVerificationCode } = checkVerification;
const { checkVerificationCode, sendVerificationCode } = require("../controllers/smsController");
const { decryptWithPrivateKey } = require("../controllers/encryptionUtils");


const { callOpenAI } = require("../controllers/chatController");
// Import the Stripe controllers
const { createCheckoutSession } = require('../controllers/stripeController');
const { createOrder } = require("../controllers/orderController");

// Protect all routes under '/api'
router.use(authenticateToken);
router.use(express.json());

// Stripe
// Add route to trigger sync
router.post("/sync-products-to-stripe", async (req, res) => {
  try {
    await syncProductsToStripe();

    res.json({
      success: true,
      message: "Products synced to Stripe successfully",
    });
  } catch (error) {
    console.error("Sync error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to sync products" });
  }
});

// Auth routes
router.post("/register", async (req, res) => {
  try {
    await register(req, res);

    res.json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Failed to register user." });
  }
});

router.post("/sessionInfo", (req, res) => {
  req.session.info = req.body;
  res.json({ success: true });
});

router.get("/getSignupInfo", (req, res) => {
  console.log("Session info:", req.session.info);
  
  if (req.session.info) {
    res.status(200).json(req.session);
  } else {
    res.status(400).json({ success: false, message: "No signup info found." });
  }
});

router.post("/login", loginController.login);
router.post("/checkUserExists", (req, res) => {
  checkUserExists(req, res);
});
router.post("/sendVerificationCode", async (req, res) => {
  const phone = req.body.phoneNumber;
  try {
    const result = await sendVerificationCode(phone);
    res.json(result); // Send resultatet tilbage til klienten
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ success: false, message: "Failed to send verification code." });
  }
});


router.get("/loginStatus", (req, res) => {


  if (req.session.loggedIn) {  
   console.log("Session loggedIn:", req.session.loggedIn);
    res.json({ loggedIn: true });
  } else {
    console.log("Session loggedIn:", req.session);
    res.json({ loggedIn: false });
  }
});

router.get("/userData", (req, res) => {
  console.log("Session user:", req.session.user);
  
  if (req.session && req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, message: "No user data available in session." });
  }
});

//**** Slet denne??? ******* */
// router.post("/send", authenticateToken, (req, res) => {
//   console.log(req.body);

//   const { phoneNumber, status } = req.body;
//   sendSMS(phoneNumber, status);
//   res.status(200).json({ success: true, message: "SMS sent" });
// });

//Bruges til at sende en verificerings kode til en bruger der er ved at logge ind

// SMS verification routes
// router.post("/sendVerificationCodeSignUp", checkVerificationCode);
router.post("/checkVerificationCode",(req,res) => {
  checkVerificationCode(req,res);
});

router.get("/products", authenticateToken, async (req, res) => {
  try {
    const products = await database.getProducts();
    res.json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
});

router.post("/chat", callOpenAI);

router.get("/cart", (req, res) => {
  console.log("Session cart:", req.session.cart);

  const cart = req.session.cart || []; // Fallback til tom array
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  res.json({
    success: true,
    totalItems: totalItems,
    cart: cart,
  });
});

router.post("/get_product_by_name_and_category", async (req, res) => {
  const { product_name, product_category } = req.body;

  try {
    const product = await database.getProductByNameAndCategory(
      product_name,
      product_category
    );

    if (product) {
      res.json({
        success: true,
        product: {
          product_id: product.productID,
          product_name: product.productName,
          product_category: product.productCategory,
          product_price: product.productPrice,
        },
      });
    } else {
      res.json({ success: false, message: "Produktet blev ikke fundet." });
    }
  } catch (error) {
    console.error("Fejl ved hentning af produkt:", error);
    res
      .status(500)
      .json({ success: false, message: "Serverfejl ved hentning af produkt." });
  }
});

router.post("/order", authenticateToken,(req,res) => {
  const { sessionId } = req.body;
  const sessionOrder = req.session.order;

  console.log("Creating order with session ID for :", sessionId, "Order:", sessionOrder);
  

  if (!sessionOrder || !sessionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing order data or session ID' 
    });
  }
  
  if (sessionId === sessionOrder.sessionId) {
    console.log("So far so good...");

    // Extract order data from session
    const orderData = {
      userID: sessionOrder.userID,
      storeID: sessionOrder.storeID,
      storeName: sessionOrder.storeName,
      products: sessionOrder.products
    };


    createOrder(req, res);
  } else {
    res.status(200).json({ success: false, message: 'Invalid session ID.' });
  }
}); 

router.post("/stores", async (req, res) => {
  console.log("Finding stores...", req.body);
  const { country, city } = req.body;
  try {
    const stores = await database.getStoresByLocation(country, city);
    res.json({ success: true, stores: stores });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch stores." });
  }
});

// Route til søgning af stores.
router.get("/store_search", async (req, res) => {
  // console.log(req);
  try {
    const result = await database.searchStores(req.query.searchTerm);
    // const res = await index.connectedDatabase.readAll("NutriDB.ingredient")
    console.log(result);
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});

router.get("/allProducts", async (req, res) => {
  try {
    const products = await database.getProductsWithIngredients();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
});

router.post("/cart/add", (req, res) => {
  try {
    // Initialiser kurven, hvis den ikke allerede eksisterer
    if (!req.session.cart) {
      req.session.cart = [];
    }

    const { productID, productName, productPrice, quantity } = req.body;

    // Find produktet i kurven
    const existingProduct = req.session.cart.find(
      (item) => item.productID === productID
    );

    if (existingProduct) {
      // Hvis produktet allerede er i kurven, øg mængden
      existingProduct.quantity += quantity;
    } else {
      // Tilføj nyt produkt til kurven
      req.session.cart.push({
        productID,
        productName,
        productPrice,
        quantity,
      });
    }

    console.log("Updated cart:", req.session.cart);

    // Send opdateret kurv tilbage til klienten
    res.json({ success: true, cart: req.session.cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: "Failed to add to cart." });
  }
});

// Define the route
router.post('/checkout', async (req, res) => {
  console.log("Creating checkout session...", req.body);
  
  createCheckoutSession(req, res);
  // const prizeId = await 
  // console.log("Creating checkout session...", req.body.cart);
  
  // try {
  //   const session = await stripe.checkout.sessions.create({
  //     line_items: req.body.cart.map((item) => {
  //       return {
  //         price_data: {
  //           currency: 'dkk',
  //           product_data: {
  //             name: item.productName,
  //           },
  //           unit_amount: item.productPrice * 100,
  //         },
  //         quantity: item.quantity,
  //       };
  //     }),
  //     mode: 'payment',
  //     success_url: 'http://localhost:3000/success',
  //     cancel_url: 'http://localhost:3000/cancel',
  //   });

  //   res.json({ id: session.id });
  // } catch (error) {
  //   console.error("Error creating checkout session:", error);
  //   res.status(500).json({ success: false, message: "Failed to create checkout session." });
  // }
});

module.exports = router;
