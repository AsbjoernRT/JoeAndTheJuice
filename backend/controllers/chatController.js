// controllers/ChatController.js

const database = require("../database/database");
const axios = require('axios');

// OpenAI API Key
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

// Funktion til at kalde OpenAI API'en
async function callOpenAI(req, res) {
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
}

module.exports = { callOpenAI };