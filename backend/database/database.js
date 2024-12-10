// backend/database/database.js
const sql = require("mssql");
const config = require("./config"); // Stien er rettet til './config'

class Database {
  constructor() {
    this.pool = null;
  }

  async connectToDatabase() {
    try {
      this.pool = await sql.connect(config);
      console.log("Connected to the database");
    } catch (err) {
      console.error("Database connection failed:", err);
      throw err;
    }
  }

  /// Hent produkter med deres ingredienser
  async getProductsWithIngredients() {
    await this.connectToDatabase();
    try {
      const request = this.pool.request();

      const result = await request.query(`
        SELECT 
            p.productID,
            p.productName,
            p.productCategory,
            p.productPrice,
            i.ingredientID,
            i.ingredientName
        FROM 
            joeAndTheJuice.products p
        JOIN 
            joeAndTheJuice.productIngredients pi ON p.productID = pi.productID
        JOIN 
            joeAndTheJuice.ingredients i ON pi.ingredientID = i.ingredientID
        ORDER BY 
            p.productName, i.ingredientName;
      `);

      if (result.recordset.length === 0) {
        return { success: false, message: 'No products with ingredients found.' };
      }

      // Organiser resultatet som en liste af produkter med deres ingredienser
      const productMap = {};
      result.recordset.forEach(row => {
        const productID = row.productID;
        if (!productMap[productID]) {
          productMap[productID] = {
            productID: productID,
            productName: row.productName,
            productCategory: row.productCategory,
            productPrice: row.productPrice,
            ingredients: []
          };
        }
        productMap[productID].ingredients.push({
          ingredientID: row.ingredientID,
          ingredientName: row.ingredientName
        });
      });

      // Konverter map til en liste
      const productsWithIngredients = Object.values(productMap);
      // console.log(productsWithIngredients);
      
      return {
        success: true,
        products: productsWithIngredients
      };
    } catch (err) {
      console.error('Failed to fetch products with ingredients:', err);
      throw new Error('Database operation failed');
    }
    
  }
  async getUserByMail(email) {
    try {
      if (!this.pool) {
        await this.connectToDatabase();
      }
      const result = await this.pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM joeAndTheJuice.users WHERE userEmail = @email');

      return result.recordset[0]; // Returnér første bruger, hvis der er et match
    } catch (err) {
      console.error('Failed to fetch user by email:', err);
      throw err;
    }
  }

  async getUserByEncryptedEmail(encryptedEmail) {
    const result = await this.pool.request()
        .input('encryptedEmail', sql.NVarChar, encryptedEmail)
        .query('SELECT * FROM joeAndTheJuice.users WHERE userEmail = @encryptedEmail');
    return result.recordset[0];
}

async getAllUsers() {
  try {
      if (!this.pool) {
          await this.connectToDatabase();
      }
      const result = await this.pool.request().query('SELECT * FROM joeAndTheJuice.users');
      return result.recordset; // Returnér alle brugere
  } catch (err) {
      console.error('Failed to fetch all users:', err);
      throw err;
  }
}

  // Oprettelse af en ny bruger [joeAndTheJuice].[users]
  async createUser(user) {
    if (!this.pool) {
        await this.connectToDatabase();
    }

    try {
        const request = this.pool.request()
            .input('firstname', sql.NVarChar, user.firstName)
            .input('lastName', sql.NVarChar, user.lastName)
            .input('email', sql.NVarChar, user.email)
            .input('phone', sql.NVarChar, user.phone)
            .input('country', sql.NVarChar, user.country)
            .input('postNumber', sql.NVarChar, user.postNumber)
            .input('city', sql.NVarChar, user.city)
            .input('street', sql.NVarChar, user.street)
            .input('houseNumber', sql.NVarChar, user.houseNumber)
            .input('password', sql.NVarChar, user.password);

        const result = await request.query(`
            INSERT INTO joeAndTheJuice.users (
                userFirstName, userLastName, userEmail, userTelephone, userCountry, 
                userPostNumber, userCity, userStreet, userHouseNumber, userPassword
            ) 
            VALUES (
                @firstname, @lastName, @email, @phone, @country, 
                @postNumber, @city, @street, @houseNumber, @password
            )
        `);

        if (result.rowsAffected[0] > 0) {
            return { success: true };
        } else {
            return { success: false, message: 'No rows affected' };
        }
    } catch (err) {
        console.error('Failed to create user:', err);
        throw new Error('Database operation failed');
    }
}


  // backend/database/database.js

  async getProductById(productId) {
    await this.connectToDatabase();
    try {
      const request = this.pool.request();
      request.input('productId', sql.Int, productId);

      const result = await request.query(`
        SELECT productID, productName, productCategory, productPrice
        FROM joeAndTheJuice.products
        WHERE productID = @productId
      `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    } catch (err) {
      console.error('Failed to fetch product by ID:', err);
      throw new Error('Database operation failed');
    }
  }

  async addToCart(productId, quantity, session) {
    console.log("Adding to cart:", productId, "Quantity:", quantity);
    
    await this.connectToDatabase();
    try {
      const product = await this.getProductById(productId);
  
      if (!product) {
        return { success: false, message: 'Produktet blev ikke fundet.' };
      }
      
      // Initialiser kurven i sessionen, hvis den ikke findes
      if (!session.cart) {
        session.cart = [];
      }
      console.log(product);
      
      // Tjek om produktet allerede er i kurven
      const existingItem = session.cart.find(item => item.productID === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        session.cart.push({
          productID: product.productID,
          productName: product.productName,
          productCategory: product.productCategory,
          productPrice: product.productPrice,
          quantity: quantity,
        });
      }
      console.log('Cart after adding product:', session.cart);
      
  
      return { success: true, message: `${product.productName} er tilføjet til din kurv.` };
    } catch (err) {
      console.error('Fejl ved tilføjelse til kurven:', err);
      return { success: false, message: 'Kunne ikke tilføje produktet til kurven.' };
    }
  }



async getProductByName(productName) {
  await this.connectToDatabase();
  try {
    const request = this.pool.request();
    request.input('productName', sql.NVarChar, `%${productName}%`);

    const result = await request.query(`
      SELECT TOP 1 productID, productName, productCategory, productPrice
      FROM joeAndTheJuice.products
      WHERE productName LIKE @productName
    `);

    if (result.recordset.length === 0) {
      return null;
    } else {
      return result.recordset[0];
    }
  } catch (err) {
    console.error('Failed to fetch product by name:', err);
    throw new Error('Database operation failed');
  }
}
async getProductByNameAndCategory(productName, productCategory) {
  await this.connectToDatabase();
  try {
    const request = this.pool.request();
    request.input("productName", sql.NVarChar, `%${productName}%`);
    request.input("productCategory", sql.NVarChar, `%${productCategory}%`);

    const result = await request.query(`
      SELECT TOP 1 productID, productName, productCategory, productPrice
      FROM joeAndTheJuice.products
      WHERE productName LIKE @productName AND productCategory LIKE @productCategory
    `);

    if (result.recordset.length === 0) {
      return null;
    }
    return result.recordset[0];
  } catch (err) {
    console.error("Failed to fetch product by name and category:", err);
    throw new Error("Database operation failed");
  }
}

// Hent butikker baseret på land og by
async getStoresByLocation(country, city) {
  await this.connectToDatabase();
  console.log('Fetching stores by location:', country, city);
  
  try {
    const request = this.pool.request();
    request.input('storeCountry', sql.NVarChar, `%${country}%`);
    request.input('storeCity', sql.NVarChar, `%${city}%`);

    const result = await request.query(`
      SELECT 
        storeID, 
        storeName, 
        storeCountry, 
        storeCity, 
        storeStreet, 
        storeHouseNumber
      FROM joeAndTheJuice.stores
      WHERE storeCountry = @storeCountry AND storeCity = @storeCity
    `);
      console.log(result);
      
    if (result.recordset.length > 0) {
      return { success: true, stores: result.recordset };
    } else {
      return { success: false, message: 'No stores found for the given location.' };
    }
  } catch (err) {
    console.error('Failed to fetch stores by location:', err);
    throw new Error('Database operation failed');
  }
}

// Søgning af Butikker via et inputfelt som får værdien searchTerm 
async searchStores(searchTerm) {
  await this.connectToDatabase();
  console.log('Searching for stores:', searchTerm);
  
  try {
    const request = this.pool.request();
    const result = await request
      .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
      .query(`SELECT * FROM joeAndTheJuice.stores WHERE storeCity LIKE @searchTerm`);
    return result.recordset;
  } catch (error) {
    console.error('Fejl ved søgning efter butik:', error);
    throw error;
  }
}

async createOrder(userID, storeID, productQuantities) {
  console.log('Creating order for user:', userID, 'store:', storeID, 'products:', productQuantities);
  
  await this.connectToDatabase();
  const transaction = new sql.Transaction(this.pool);
  
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Get current UTC date and time
    const now = new Date();
    const orderDate = now.toISOString().split('T')[0];
    const orderTimeString = now.toISOString();

    console.log('Order date:', orderDate, 'order time:', orderTimeString);

    // Combined query - calculate total and create order
    const orderResult = await request
      .input('userID', sql.Int, userID)
      .input('storeID', sql.Int, storeID)
      .input('orderDate', sql.Date, orderDate)
      .input('orderTime', sql.NVarChar, orderTimeString)
      .input('productQuantities', sql.VarChar, JSON.stringify(productQuantities))
      .query(`
        DECLARE @totalPrice INT;
        DECLARE @CopenhagenTime AS datetimeoffset;
        
        -- Calculate total price
        SELECT @totalPrice = SUM(p.productPrice * pq.quantity)
        FROM OPENJSON(@productQuantities)
        WITH (
          productID INT,
          quantity INT
        ) pq
        JOIN joeAndTheJuice.products p ON p.productID = pq.productID;

        -- Set Copenhagen time
        SET @CopenhagenTime = SWITCHOFFSET(CAST(@orderTime AS datetimeoffset), '+00:00');
        
        -- Create order and get ID
        DECLARE @InsertedOrders TABLE (orderID INT);
        INSERT INTO joeAndTheJuice.orders (userID, storeID, totalPrice, orderDate, orderTime)
        OUTPUT INSERTED.orderID INTO @InsertedOrders
        VALUES (@userID, @storeID, @totalPrice, @orderDate, @CopenhagenTime);

        -- Insert order products
        INSERT INTO joeAndTheJuice.orderProducts (orderID, productID, quantity)
        SELECT (SELECT TOP 1 orderID FROM @InsertedOrders), pq.productID, pq.quantity
        FROM OPENJSON(@productQuantities)
        WITH (
          productID INT,
          quantity INT
        ) pq;

        -- Return order ID and total price
        SELECT TOP 1 orderID, @totalPrice as totalPrice 
        FROM @InsertedOrders;
      `);

    await transaction.commit();
    
    const result = orderResult.recordset[0];
    if (!result || !result.orderID) {
      throw new Error('Failed to create order.');
    }

    return { 
      success: true, 
      message: 'Order created successfully', 
      orderID: result.orderID, 
      totalPrice: result.totalPrice 
    };

  } catch (err) {
    await transaction.rollback();
    console.error('Error creating order:', err);
    throw new Error('Database operation failed');
  }
}

// Tilføj flere databasefunktioner efter behov
}



module.exports = new Database();