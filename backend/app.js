// backend/app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const apiRoutes = require('./routes/apiRoutes');
const viewRoutes = require('./routes/viewRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
// Din OpenAI API-nøgle fra miljøvariabler
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

// Endpoint til at håndtere chat-anmodninger
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
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

// Routes
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

module.exports = app;