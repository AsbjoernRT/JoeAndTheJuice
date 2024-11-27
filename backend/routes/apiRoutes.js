// backend/routes/apiRoutes.js
const express = require("express");
const router = express.Router();
const apiController = require('../controllers/apiController');
const axios = require('axios');
const database = require('../database/database');
const signupController = require('../controllers/signupController');
const loginController = require('../controllers/loginController');
const { login } = loginController;
const { register } = signupController;
const checkVerification = require('../controllers/authenticationController');
const { sendVerificationCode, checkVerificationCode} = checkVerification;
const sms = require('../controllers/sms');
const { sendSMS } = sms;
const { decryptWithPrivateKey } = require('../controllers/encryptionUtils');
const session = require("express-session");



router.use(express.json());

// Route til registrering af nye brugere
router.post('/register', (req, res, next) => {
  register(req, res, next); // Kalder register-funktionen fra signupController
});

router.post('/login', loginController.login); // Processér login-anmodningen

router.get('/login_status', (req, res) => {
  console.log(req.session);
  
  if (req.session.loggedin) { // Hvis brugeren er logget ind
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/user_data', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.json({ success: false, message: 'No user data available in session.' });
  }
});

router.post('/send', (req, res) => {
  console.log(req.body);
  
  const { phoneNumber, status } = req.body;
  sendSMS(phoneNumber, status);
  res.status(200).json({ success: true, message: 'SMS sent' });
});

//Bruges til at sende en verificerings kode til en bruger der er ved at logge ind

router.post('/sendVerificationCode', (req, res) => {
  console.log(req.body);
  const { phoneNumber, code } = req.body;
  checkVerificationCode(phoneNumber, code)
  .then((verificationResult) => {
    if (verificationResult.success) {
      res.status(200).json({ success: true, message: verificationResult.message });
    } else {
      res.status(401).json({ success: false, message: verificationResult.message });
    }
  })
  .catch((error) => {
    console.error('Fejl i verificerings-endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  });
});

//Bruges til at sende en verificerings kode til en bruger der er ved at oprette sig

router.post('/sendVerificationCodeSignUp', (req, res) => {
  console.log(req.body);
  const { phoneNumber, code } = req.body;
  phoneNumberDecrypted = decryptWithPrivateKey(phoneNumber);
  console.log("Dekrypteret telefonnummer:",  phoneNumberDecrypted);
  
  sendVerificationCode(phoneNumberDecrypted);
  res.status(200).json({ success: true, message: 'SMS sent' });
});
  



router.get('/products', async (req, res) => {
  try {
    const products = await database.getProducts();
    res.json({ success: true, products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Din OpenAI API-nøgle fra miljøvariabler
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Kontroller, om API-nøglen er indlæst
if (!OPENAI_API_KEY) {
  console.error(
    "Fejl: OpenAI API-nøglen er ikke indlæst. Kontroller dine miljøvariabler."
  );
} else {
  console.log("OpenAI API-nøglen er korrekt indlæst.");
}

// Definer funktionerne, som chatbotten kan kalde
const functions = [
  {
    name: "get_all_products",
    description: "Hent en liste med alle produkterne fra databasen",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_product",
    description:
      "Find et produkt baseret på navn og kategori og returnér dets detaljer, inklusive produkt-ID",
    parameters: {
      type: "object",
      properties: {
        product_name: {
          type: "string",
          description: "Navnet på produktet, fx 'Avocado'",
        },
        product_category: {
          type: "string",
          description: "Kategorien af produktet, fx 'Sandwich'",
        },
      },
      required: ["product_name"],
    },
  },
  {
    name: "add_to_cart",
    description:
      "Tilføj et produkt til indkøbskurven ved hjælp af produkt-ID og mængde.",
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "integer",
          description: "ID for produktet, fx 62 for 'Turmeric Shot'",
        },
        quantity: {
          type: "integer",
          description: "Antal enheder af produktet, der skal tilføjes",
          minimum: 1,
        },
      },
      required: ["product_id", "quantity"],
    },
  },
  {
    name: "remove_from_cart",
    description: "Fjern et produkt fra indkøbskurven",
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "integer",
          description: "ID for produktet, der skal fjernes fra kurven",
        },
        quantity: {
          type: "integer",
          description: "Antal enheder af produktet, der skal tilføjes",
          minimum: 1,
        },
      },
      required: ["product_id", "quantity"],
    },
  },
  {
    name: "check_cart",
    description: "Vis indholdet af indkøbskurven",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "checkout",
    description: "Gennemfør checkout-processen for brugeren",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  //Tilføj flere funktioner efter behov
];


router.post("/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    let response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", // Sørg for, at dette er et gyldigt modelnavn
        messages: messages,
        functions: functions,
        function_call: "auto",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    let assistantMessage = response.data.choices[0].message;

    // Loop for at håndtere flere funktionskald
    while (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

      let functionResponse;

      if (functionName === "get_all_products") {
        const result = await database.getProductsWithIngredients();

        functionResponse = result.success
          ? { status: "success", data: result.products }
          : { status: "error", message: result.message };
      } else if (functionName === "get_product") {
        const productName = functionArgs.product_name;
        const productCategory = functionArgs.product_category || ""; // Hvis kategori ikke er angivet

        console.log(
          "Getting product by name:",
          productName,
          "and category:",
          productCategory
        );

        let product;

        if (productCategory) {
          product = await database.getProductByNameAndCategory(
            productName,
            productCategory
          );
        } else {
          product = await database.getProductByName(productName);
        }

        functionResponse = product
          ? {
              status: "success",
              product: {
                product_id: product.productID,
                product_name: product.productName,
                product_category: product.productCategory,
                product_price: product.productPrice,
              },
            }
          : { status: "error", message: "Produktet blev ikke fundet." };
      } else if (functionName === "add_to_cart") {
        const productId = functionArgs.product_id;
        const quantity = functionArgs.quantity || 1; // Standard til 1, hvis ikke angivet
        console.log("Adding product to cart:", productId, quantity);

        const result = await database.addToCart(
          productId,
          quantity,
          req.session
        );

        functionResponse = result.success
          ? { status: "success", message: result.message }
          : { status: "error", message: result.message };
        } else if (functionName === "check_cart") {
          console.log("Checking cart");
        
          const cart = req.session.cart || [];
          functionResponse = {
            status: "success",
            cart: cart,
          };
        
          console.log("Current cart:", cart);
        } else if (functionName === "remove_from_cart") {
        const productId = functionArgs.product_id;
        const quantity = functionArgs.quantity || 1; // Standard til 1, hvis ikke angivet
        console.log("Removing ", quantity, " from cart:", productId);

        if (!req.session.cart) req.session.cart = [];

        const existingItemIndex = req.session.cart.findIndex(
          (item) => item.productID === productId
        );

        if (existingItemIndex !== -1) {
          const existingItem = req.session.cart[existingItemIndex];
          // Reducer mængden eller fjern produktet helt, hvis mængden er 0 eller mindre
          existingItem.quantity -= quantity;
          if (existingItem.quantity <= 0) {
            // Fjern produktet helt fra kurven
            req.session.cart.splice(existingItemIndex, 1);
            functionResponse = {
              status: "success",
              message: `${existingItem.productName} er helt fjernet fra din kurv.`,
            };
          } else {
            // Opdater kurven med reduceret mængde
            functionResponse = {
              status: "success",
              message: `${quantity} af ${existingItem.productName} er fjernet fra din kurv.`,
            };
          }
        } else {
          // Hvis produktet ikke findes i kurven
          functionResponse = {
            status: "error",
            message: "Produktet findes ikke i din kurv.",
          };
        }

        console.log("Current cart after removal:", req.session.cart);
      } else if (functionName === "checkout") {
        console.log("Processing checkout");

        if (req.session.cart && req.session.cart.length > 0) {
          functionResponse = {
            status: "success",
            message: "Du kan nu gå til checkout for at fuldføre dit køb.",
          };
        } else {
          functionResponse = {
            status: "error",
            message:
              "Din kurv er tom. Tilføj venligst varer til din kurv, før du checker ud.",
          };
        }

        console.log("Checkout response:", functionResponse);
      }

      // Tilføj assistentens funktionkald til beskederne
      messages.push({
        role: "assistant",
        content: assistantMessage.content || "",
        function_call: assistantMessage.function_call,
      });

      // Tilføj funktionens svar til beskederne
      messages.push({
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResponse) || "",
      });

      // Validering af beskeder før afsendelse
      messages.forEach((msg, index) => {
        if (typeof msg.content !== "string") {
          console.error(`Besked ved indeks ${index} har ugyldig content:`, msg);
          msg.content = "";
        }
      });
      // Send den opdaterede samtale tilbage til OpenAI
      response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: messages,
          functions: functions,
          function_call: "auto",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      assistantMessage = response.data.choices[0].message;
    }

    // Ingen flere funktionskald, send assistentens svar tilbage til brugeren
    res.json(response.data);
  } catch (error) {
    console.error(
      "Fejl ved kommunikation med OpenAI:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Fejl ved kommunikation med OpenAI" });
  }
});

router.get("/cart", (req, res) => {
  const cart = req.session.cart || [];

  // Beregn det samlede antal produkter baseret på deres mængde (quantity)
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

router.post("/order", async (req, res) => {
  const { userID, storeID, products } = req.body;
  console.log("Creating order...", req.body);
  try {
    const result = await database.createOrder(userID, storeID, products);
    res.json(result);
    console.log("Resultat", result);
    // Slet brugerens kurv
    req.session.cart = [];
    req.session.cart.totalItems = 0;
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order." });
  }
});

router.post("/stores", async (req, res) => {
  console.log("Finding stores...",req.body)
  const {country, city} = req.body
  try {
    const stores = await database.getStoresByLocation(country, city);
    res.json({ success: true, stores: stores });
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stores." });
  }
});

// Route til søgning af stores.
router.get('/store_search', async (req, res) => {
  // console.log(req);
  try {
      const result = await database.searchStores(req.query.searchTerm)
      // const res = await index.connectedDatabase.readAll("NutriDB.ingredient")
      console.log(result);
      res.json(result)
  } catch (error) {
      console.log(error);
  }
})

module.exports = router;
