// backend/routes/apiRoutes.js
const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const axios = require("axios");
const database = require("../database/database");
const signupController = require("../controllers/signupController");
const loginController = require("../controllers/loginController");
const { login } = loginController;
const { register } = signupController;
const checkVerification = require("../controllers/authenticationController");
const { sendVerificationCode, checkVerificationCode } = checkVerification;
const sms = require("../controllers/sms");
const { sendSMS, formatProductsForSMS } = sms;
const { decryptWithPrivateKey } = require("../controllers/encryptionUtils");
const session = require("express-session");
const { authenticateToken } = require("../controllers/jwtToken");
const { callOpenAI } = require("../controllers/chatController");
// Import the Stripe controller
const { createCheckoutSession } = require('../controllers/stripeController');

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

// Route til registrering af nye brugere
router.post("/register", (req, res, next) => {
  register(req, res, next); // Kalder register-funktionen fra signupController
});

router.post("/login", loginController.login); // Processér login-anmodningen

router.get("/login_status", (req, res) => {
  console.log(req.session);

  if (req.session.loggedin) {
    // Hvis brugeren er logget ind
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get("/user_data", authenticateToken, (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, message: "No user data available in session." });
  }
});

router.post("/send", authenticateToken, (req, res) => {
  console.log(req.body);

  const { phoneNumber, status } = req.body;
  sendSMS(phoneNumber, status);
  res.status(200).json({ success: true, message: "SMS sent" });
});

//Bruges til at sende en verificerings kode til en bruger der er ved at logge ind

router.post("/sendVerificationCode", (req, res) => {
  console.log(req.body);
  const { phoneNumber, code } = req.body;
  checkVerificationCode(phoneNumber, code)
    .then((verificationResult) => {
      if (verificationResult.success) {
        res
          .status(200)
          .json({ success: true, message: verificationResult.message });
      } else {
        res
          .status(401)
          .json({ success: false, message: verificationResult.message });
      }
    })
    .catch((error) => {
      console.error("Fejl i verificerings-endpoint:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    });
});

//Bruges til at sende en verificerings kode til en bruger der er ved at oprette sig

router.post("/sendVerificationCodeSignUp", (req, res) => {
  console.log(req.body);
  const { phoneNumber } = req.body;
  console.log("Dekrypteret telefonnummer:", phoneNumber);

  sendVerificationCode(phoneNumber);
  res.status(200).json({ success: true, message: "SMS sent" });
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

router.post("/order", authenticateToken, async (req, res) => {
  const { userID, storeID, storeName, products } = req.body;
  console.log("Creating order...", req.body);
  try {
    const result = await database.createOrder(userID, storeID, products);
    req.session.cart = []; // Ryd brugerens kurv
    res.json(result);
    console.log("Resultat", result);

    let SMSphone = "+45" + req.session.user.phone;
    let formattedProducts = await formatProductsForSMS(
      products,
      result.totalPrice
    );
    console.log("Formatted products for SMS:", formattedProducts);
    let formattedStoreName = storeName.trim();
    // Only send SMS if we have formatted products
    if (formattedProducts && formattedProducts.productList) {
      let SMSphone = "+45" + req.session.user.phone;
      await sendSMS(
        SMSphone,
        "bekræftelse",
        result.orderID,
        formattedProducts,
        formattedStoreName
      );
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create order." });
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
router.post('/create-checkout-session', createCheckoutSession);

module.exports = router;
