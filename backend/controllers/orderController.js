// controllers/orderController.js
const database = require("../database/database");
const { formatProductsForSMS, sendSMS } = require("./smsController");

exports.createOrder = async (req, res) => {
  const sessionOrder = req.session.order;
  console.log("Session order:", sessionOrder);
  
  const orderData = {
    userID: sessionOrder.userID,
    storeID: sessionOrder.storeID,
    storeName: sessionOrder.storeName,
    products: sessionOrder.products
  };

  const productData = {
    products: req.session.cart
  }

  console.log("Cart products:", productData.products);
  

  console.log("Creating order...", orderData);
  try {
    const result = await database.createOrder(orderData.userID, orderData.storeID, productData.products);
    req.session.cart = []; // Ryd brugerens kurv
    req.session.order = {}; // Ryd ordredata
    console.log("Resultat", result);

    const SMSphone = "+45" + req.session.user.phone;
    const formattedProducts = await formatProductsForSMS(
      productData.products,
      result.totalPrice
    );
    console.log("Formatted products for SMS:", formattedProducts);
    const formattedStoreName = orderData.storeName.trim();
    // Send SMS hvis vi har formatterede produkter
    if (formattedProducts && formattedProducts.productList) {
      sendSMS(
        SMSphone,
        "bekræftelse",
        result.orderID,
        formattedProducts,
        formattedStoreName
      );
    }
    res.json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create order." });
  }
};

