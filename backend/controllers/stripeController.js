const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

// Function to sync products to Stripe
async function syncProductsToStripe() {
    try {
      // Get products from database
      const result = await database.getProductsWithIngredients();
  
      if (!result || !result.success || !Array.isArray(result.products)) {
        throw new Error("Fetched products data is invalid");
      }
  
      const products = result.products; // Extract the products array
      console.log("Fetched products:", products);
  
      for (const product of products) {
        let stripeProduct;
  
        try {
          stripeProduct = await stripe.products.retrieve(
            product.productID.toString()
          );
        } catch (error) {
          // Create new product in Stripe if it doesn't exist
          stripeProduct = await stripe.products.create({
            id: product.productID.toString(), // Ensure the ID is a string for Stripe
            name: product.productName,
            description: `Category: ${product.productCategory}`,
            metadata: {
              category: product.productCategory,
            },
          });
  
          // Create a price for the product
          const price = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(product.productPrice * 100), // Convert to cents
            currency: "dkk",
          });
  
          // Update product with default price
          await stripe.products.update(stripeProduct.id, {
            default_price: price.id,
          });
        }
  
        console.log(`Synced product: ${product.productName}`);
      }
  
      console.log("All products synced to Stripe successfully");
    } catch (error) {
      console.error("Error syncing products to Stripe:", error);
      throw error;
    }
  }

  // Function to get price for a product
async function getPriceForProduct(productID) {
    try {
      // Fetch all prices for the given product
      const prices = await stripe.prices.list({
        product: productID,
      });
  
      if (prices.data.length === 0) {
        throw new Error(`No prices found for product ID: ${productID}`);
      }
  
      // Assuming you want the first price (or adjust logic accordingly)
      const price = prices.data[0];
      return price.id;
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }
  
  // Controller function for creating a checkout session
  async function createCheckoutSession(req, res) {
    const order = req.body
    req.session.order = order;
    console.log('Creating checkout session with order:', req.session.order);
    try {
      const products = req.body.products; // Retrieve array of products from request body
      console.log('Creating checkout session with products:', products);
  
      // Validate input
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ success: false, message: 'Products array is required and cannot be empty.' });
      }
  
      // Build line_items array
      const lineItems = [];
      
  
      for (const product of products) {
        const { productID, quantity } = product;
  
        // Validate individual product
        if (!productID || !quantity) {
          return res.status(400).json({ success: false, message: 'Each product must have a productID and quantity.' });
        }
  
        // Fetch priceId for the given productID
        const priceId = await getPriceForProduct(productID);
  
        if (!priceId) {
          return res.status(400).json({ success: false, message: `Price ID not found for product ID ${productID}.` });
        }
  
        console.log(`Price ID for product ${productID}:`, priceId);
  
        // Add to line items
        lineItems.push({
          price: priceId,
          quantity: quantity,
        });
      }
  console.log('Line items:', lineItems);
  
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
        customer_email: req.session.user.email, // Add prefilled email here
      });

      req.session.order.sessionId = session.id;
      console.log('Checkout session created:', session.id);
      
  
      res.json({ success: true, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ success: false, message: 'Failed to create checkout session.' });
    }
  }

  module.exports = {
    createCheckoutSession, 
  };