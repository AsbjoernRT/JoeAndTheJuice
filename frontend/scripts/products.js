// products.js
async function getAllProducts() {
  try {
    const response = await fetch('/api/allProducts', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      console.error('Failed to fetch products:', data.message);
      return null;
    }

    return data.products; // Return the products array
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
}

// products.js
async function displayProducts() {
  console.log('Fetching products...');
  const products = await getAllProducts(); // Should be the array of products
  console.log('Products received:', products);

  if (!products || !Array.isArray(products)) {
    console.error('Invalid products data:', products);
    return;
  }

  const productContainer = document.createElement('div');
  productContainer.className = 'product-carousel';

  products.forEach(product => {
    const card = createProductCard(product);
    productContainer.appendChild(card);
  });

  const mainContainer = document.getElementById('main-container');
  if (!mainContainer) {
    console.error('Main container not found');
    return;
  }

  mainContainer.appendChild(productContainer);

  // Initialize carousel after DOM update
  setTimeout(() => {
    $('.product-carousel').slick({
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1024,
          settings: { slidesToShow: 3, slidesToScroll: 3 }
        },
        {
          breakpoint: 600,
          settings: { slidesToShow: 2, slidesToScroll: 2 }
        }
      ]
    });
  }, 100);
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';

  card.innerHTML = `
    <img src="/images/products/${product.productID}.jpg" 
         alt="${product.productName}" 
         onerror="this.src='/assets/joe americano.jpg'">
    <h3>${product.productName}</h3>
    <p class="price">${product.productPrice} kr</p>
    <button onclick="addToCart(${product.productID}, '${product.productName}', ${product.productPrice})">
      Add to Cart
    </button>
  `;

  return card;
}


