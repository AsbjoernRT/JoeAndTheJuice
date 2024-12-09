// controllers/orderController.js
const database = require("../database/database");
const { formatProductsForSMS, sendSMS } = require("./smsController");

exports.createOrder = async (req, res) => {
  const { userID, storeID, storeName, products } = req.body;
  console.log("Creating order...", req.body);
  try {
    const result = await database.createOrder(userID, storeID, products);
    req.session.cart = []; // Ryd brugerens kurv
    console.log("Resultat", result);

    const SMSphone = "+45" + req.session.user.phone;
    const formattedProducts = await formatProductsForSMS(
      products,
      result.totalPrice
    );
    console.log("Formatted products for SMS:", formattedProducts);
    const formattedStoreName = storeName.trim();
    // Send SMS hvis vi har formatterede produkter
    if (formattedProducts && formattedProducts.productList) {
      await sendSMS(
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