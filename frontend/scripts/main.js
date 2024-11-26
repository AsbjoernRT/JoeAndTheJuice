document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  console.log(`Current path: ${path}`); // Debug: Se stien i konsollen

  if (path === '/checkout') {
    // Kald kun checkout-relaterede funktioner
    checkoutProducts();
    updateCartBadge();
    storeSearch();
  };

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const mainContent = document.getElementById('main-content');
    const chatButton = document.getElementById('chat-button');
    const chatModal = document.getElementById('chat-modal');
    const closeChat = document.getElementById('close-chat');
    const navLinks = document.querySelectorAll('#sidebar ul li a[data-page]');
  
    // Load the home page by default
    // loadPage('home');

    // Delay opdatering af badge
  setTimeout(() => {
    updateCartBadge();
  }, 500); // Forsinkelse på 1 sekund
});

document.getElementById("pay-now").addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/cart");
      const cart = await response.json();
      console.log("Producter i kurven: ",cart);
});


  async function updateCartBadge() {
    try {
      const response = await fetch("http://localhost:3000/api/cart");
      const data = await response.json();
      console.log(data);
      
      if (data.success) {
        const cartBadge = document.getElementById("cart-badge");
        const totalItems = data.totalItems;
  
        if (totalItems > 0) {
          cartBadge.textContent = totalItems;
          cartBadge.style.display = "block";
        } else {
          cartBadge.style.display = "none";
        }
      } else {
        console.error("Fejl ved hentning af kurvstatus:", data.message);
      }
    } catch (error) {
      console.error("Fejl ved opdatering af kurvbadge:", error);
    }
  }


async function checkoutProducts() {
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
  
    try {
      // Hent kurv fra backend via session storage
      const response = await fetch("http://localhost:3000/api/cart");
      const data = await response.json();
  
      if (!data.success || !data.cart || data.cart.length === 0) {
        // Hvis kurven er tom, vis en tom besked
        orderItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        subtotalElement.textContent = 'DKK 0.00';
        totalElement.textContent = 'DKK 0.00';
        return;
      }
  
      const cart = data.cart;
      let subtotal = 0;
  
      // Ryd containeren før opdatering
      orderItemsContainer.innerHTML = '';
  
      // Loop gennem kurvens produkter og generer HTML
      cart.forEach((item) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('order-item');
        itemElement.innerHTML = `
          <div class="item-details">
            <p class="item-name">${item.productName}</p>
            <p class="item-quantity">Quantity: ${item.quantity}</p>
          </div>
          <div class="item-price">DKK ${(item.productPrice * item.quantity).toFixed(2)}</div>
        `;
  
        orderItemsContainer.appendChild(itemElement);
  
        // Beregn subtotal
        subtotal += item.productPrice * item.quantity;
      });
  
      // Opdater subtotal og total
      subtotalElement.textContent = `DKK ${subtotal.toFixed(2)}`;
      totalElement.textContent = `DKK ${subtotal.toFixed(2)}`; // Antag gratis fragt
    } catch (error) {
      console.error("Fejl ved hentning af kurv fra session storage:", error);
  
      // Vis fejlbesked i UI
      orderItemsContainer.innerHTML = '<p>Unable to load cart. Please try again later.</p>';
      subtotalElement.textContent = 'DKK 0.00';
      totalElement.textContent = 'DKK 0.00';
    }
  }

  function storeSearch() {
    var inputElement = document.getElementById('searchInput'); // Henter input-elementet for søgning
    var resultsDiv = document.getElementById('searchResults'); // Henter div-elementet hvor søgeresultater vises

    var debounceTimerId;

    inputElement.addEventListener('input', function () {
        clearTimeout(debounceTimerId);  // Stop den tidligere satte timer
        debounceTimerId = setTimeout(() => {
            var searchTerm = inputElement.value;  // Gemmer den indtastede søgeværdi
            if (searchTerm.length > 1) { // Sikrer at der er mindst 2 tegn før søgning
                fetch("/api/store_search?searchTerm=" + searchTerm)
                    .then(res => res.json())
                    .then((res) => {
                        console.log("Frontend",res);
                        displayResults(res)
                    });
            } else {
                resultsDiv.innerHTML = ''; // Tømmer søgeresultater hvis søgeterm er for kort
            }
        }, 200); // Debounce tid på 200 millisekunder
    });
};


function displayResults(items) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    items.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item'); // Tilføjer klasse til resultatdiv
        resultItem.textContent = item.storeName; // Sætter tekstindholdet til fødevarens navn
        resultItem.onclick = function () { selectItem(item); }; // Tilføjer funktion til at vælge element ved klik
        resultsContainer.appendChild(resultItem);
    });
}

function selectItem(item) {
  selectedItemData = {};
  document.getElementById('searchInput').value = item.storeName;
  
  // Tjek om `selectedItem` elementet findes
  const selectedItemElement = document.getElementById('selectedItem');
  if (selectedItemElement) {
      selectedItemElement.textContent = `Selected Item: ${item.storeName}`;
  } else {
      console.log('Element with ID "selectedItem" not found.');
  }

  document.getElementById('searchResults').innerHTML = '';

  // Gemmer og returnerer data om det valgte element
  return selectedItemData = {
      storeName: item.storeName,
      storeID: item.storeID,
      storeCountry: item.storeCountry,
      storeCity: item.storeCity,
      storeStreet: item.storeStreet,
      storeHouseNumber: item.storeHouseNumber
  };
}