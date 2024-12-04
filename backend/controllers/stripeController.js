const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


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
async function getPriceForProduct(productId) {
    try {
      // Fetch all prices for the given product
      const prices = await stripe.prices.list({
        product: productId,
      });
  
      if (prices.data.length === 0) {
        throw new Error(`No prices found for product ID: ${productId}`);
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
    try {
      const { productId, quantity } = req.body; // Retrieve productId and quantity from request body
  
      // Validate input
      if (!productId || !quantity) {
        return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
      }
  
      // Fetch priceId for the given productId
      const priceId = await getPriceForProduct(productId);
  
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success.html`,
        cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      });
  
      res.json({ success: true, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ success: false, message: 'Failed to create checkout session.' });
    }
  }

  module.exports = {
    createCheckoutSession, syncProductsToStripe
  };