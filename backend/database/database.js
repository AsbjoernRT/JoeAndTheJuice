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


// Tilføj flere databasefunktioner efter behov
}



module.exports = new Database();
