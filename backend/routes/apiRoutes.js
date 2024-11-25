// backend/routes/apiRoutes.js
//console.log('apiRoutes.js er indlæst');

require('dotenv').config(); // Indlæs miljøvariabler

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const axios = require('axios');
const database = require('../database/database');

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
    console.error('Fejl: OpenAI API-nøglen er ikke indlæst. Kontroller dine miljøvariabler.',"nøgle: ", OPENAI_API_KEY);
  } else {
    console.log('OpenAI API-nøglen er korrekt indlæst.');
  }

// Definer funktionerne, som chatbotten kan kalde
const functions = [
  {
    name: "add_to_cart",
    description: "Tilføj et produkt til indkøbskurven",
    parameters: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "ID på produktet. Eksempel: '1', '2', '3'" },
      },
      required: ["product_id"],
    },
  },
  {
    name: "remove_from_cart",
    description: "Fjern et produkt fra indkøbskurven",
    parameters: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "ID på produktet. Eksempel: '1', '2', '3'" },
      },
      required: ["product_id"],
    },
    },
    {
        name: "check_cart",
        description: "Se indholdet af indkøbskurven",
        parameters: {
          type: "object",
          properties: {
            product_id: { type: "string", description: "ID på produktet. Eksempel: '1', '2', '3'" },
          },
          required: ["product_id"],
        },
      },
  {
    name: "proceed_to_checkout",
    description: "Fortsæt til check-out",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_product_info",
    description: "Hent information om et produkt",
    parameters: {
      type: "object",
      properties: {
        product_name: { type: "string", description: "Navn på produktet" },
      },
      required: ["product_name"],
    },
  },
];

// Flyt `/api/chat` endpointet her
router.post('/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Opdateret modelnavn
        messages: messages,
        functions: functions,
        function_call: 'auto',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Fejl ved anmodning til OpenAI:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Fejl ved kommunikation med OpenAI' });
  }
});

// Define API endpoints
router.get('/menu', apiController.getMenuItems);
router.get('/locations', apiController.getLocations);
router.post('/order', apiController.startOrder);



module.exports = router;