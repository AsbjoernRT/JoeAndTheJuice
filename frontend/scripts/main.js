document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  console.log(`Current path: ${path}`); // Debug: Se stien i konsollen

  if (path === "/signup") {
    setTimeout(() => {
      updateCartBadge();
    }, 50);
  }
  if (path === "/") {
    displayProducts();
  }

  if (path === "/success") {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
  
    if (sessionId) {
      console.log("Checkout session ID:", sessionId);
      verifyOrder(sessionId)
      
    }
  }

    async function verifyOrder(sessionId) {
      try {
        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        });
    
        const result = await response.json();
        console.log('Order verification result:', result);
      }catch (error) {
        console.error('Error verifying order:', error);
  }}
  // displayProducts()
  if (path === "/cart") {
    // Kald kun checkout-relaterede funktioner
    // checkLoginStatus();
    populateUserDetails();
    checkoutProducts();
    storeSearch();
    setTimeout(() => {
      updateCartBadge();
    }, 50);

    document.getElementById("pay-now").addEventListener("click", async () => {
      event.preventDefault(); // Forhindrer form submission
      try {
        // Fetch user data using fetchUserData
        const userData = await fetchUserData();
        if (!userData || !userData.userId) {
          alert("User is not logged in. Please log in to proceed.");
          return;
        }

        const userID = userData.userId;
        console.log("User ID:", userID);

        // Get selected store name from the input field
        const storeID = parseInt(sessionStorage.getItem("selectedStore"), 10);
        if (!storeID) {
          alert("Please select a store before proceeding.");
          return;
        }

        let storeName = sessionStorage.getItem("selectedName");
        console.log("Selected store:", storeID, storeName);

        const cartData = JSON.parse(sessionStorage.getItem("cart"));
        console.log("Cart data:", cartData);

        if (!cartData) {
          alert("No products found in the cart. Please try again.");
          return;
        }
        // Byg en liste over produkter med produkt-ID og mængde
        const products = cartData.map((item) => ({
          productID: item.productID,
          quantity: item.quantity,
        }));

        if (products.length === 0) {
          alert("No valid products found in the cart.");
          return;
        }

        // Opret payload til backend
        const payload = {
          userID,
          storeID,
          storeName,
          products,
        };

        console.log("Payload to send:", payload);
        // Send the data to the backend
        // const response = await fetch("/api/order", {
        // const response = await fetch("/create-checkout-sessionr", {
        const response = await fetch("api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("Order response:", result);
        if (response.ok && result.success) {
          // Redirect to the Stripe checkout page
          window.location.href = result.url;
        } else {
          console.error("Error creating checkout session:", result.message);
          alert("An error occurred while creating the checkout session.");
        }
      } catch (error) {
        console.error("Error placing order:", error);
        alert(
          "An error occurred while placing the order. Please try again later."
        );
      }

      //     // Handle backend response
      //     if (result.success) {
      //       alert(`Order placed successfully! Order ID: ${result.orderID}`);
      //       sessionStorage.removeItem("cart");
      //       sessionStorage.removeItem("selectedStore");
      //       sessionStorage.removeItem("userData");
      //       sessionStorage.removeItem("user");
      //       sessionStorage.removeItem("orderID");
      //       // Clear the cart after a successful order

      //       // Opdater badge til 0
      //       const cartBadge = document.getElementById("cart-badge");
      //       if (cartBadge) {
      //         cartBadge.textContent = "";
      //         cartBadge.style.display = "none";
      //       }
      //       window.location.href = "/";
      //     } else {
      //       console.error("Failed to place order:", result.message);
      //       alert("Failed to place the order. Please try again.");
      //     }
      //   } catch (error) {
      //     console.error("Error placing order:", error, result);
      //     alert(
      //       "An error occurred while placing the order. Please try again later."
      // );
      // }
    });
  }

  if (path === "/login") {
    setTimeout(() => {
      updateCartBadge();
    }, 50);
  }

  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const content = document.getElementById("content");
  const mainContent = document.getElementById("main-content");
  const chatButton = document.getElementById("chat-button");
  const chatModal = document.getElementById("chat-modal");
  const closeChat = document.getElementById("close-chat");
  const navLinks = document.querySelectorAll("#sidebar ul li a[data-page]");

  // Load the home page by default
  // loadPage('home');

  // Delay opdatering af badge
  setTimeout(() => {
    updateCartBadge();
  }, 500); // Forsinkelse på 1 sekund
});

async function populateUserDetails() {
  try {
    // Fetch user data from the server
    const userData = await fetchUserData();
    if (!userData) return;

    // Populate the form with user data
    populateFormFields(userData);

    console.log("Form populated with user data from session storage.");
  } catch (error) {
    console.error("Error populating user details:", error);
  }
}

// Fetch user data from the server and store in session storage
async function fetchUserData() {
  try {
    const response = await fetch("/api/userData");
    const data = await response.json();

    if (data.success && data.user) {
      console.log("User data fetched:", data.user);
      sessionStorage.setItem("userData", JSON.stringify(data.user));
      return data.user;
    } else {
      console.warn("No user data found in session:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Populate form fields with user data
function populateFormFields(userData) {
  if (!userData) {
    console.log("No user data found in session storage.");
    return;
  }

  const formFields = [
    { id: "email", value: userData.email },
    { id: "first-name", value: userData.firstName },
    { id: "last-name", value: userData.lastName },
    { id: "address", value: userData.street },
    { id: "number", value: userData.houseNumber },
    { id: "city", value: userData.city },
    { id: "country", value: userData.country },
    { id: "postal-code", value: userData.postNumber },
  ];

  formFields.forEach(({ id, value }) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = value || "";
    } else {
      console.warn(`Element with ID "${id}" not found.`);
    }
  });

  const houseInput = document.querySelector(
    'input[name="address"]:nth-of-type(2)'
  );
  if (houseInput) {
    houseInput.value = userData.houseNumber || "";
  }

  const countrySelect = document.getElementById("country");
  if (countrySelect) {
    countrySelect.value = userData.country || "";
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = userData.selectedStore || "";
  }
}

function checkLoginStatus() {
  console.log("Checking login status...");

  fetch("/api/loginStatus")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to check login status");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Login status:", data);
      if (data.loggedIn) {
        // Brugeren er logget ind
        console.log("Bruger er logget ind");
      } else {
        // Brugeren er ikke logget ind
        console.log("Bruger er ikke logget ind");
        window.location.href = "/login";
      }
    })
    .catch((error) => {
      console.error("Fejl ved tjek af login status:", error);
      window.location.href = "/login";
    });
}

async function updateCartBadge() {
  try {
    const response = await fetch("/api/cart");
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
  const orderItemsContainer = document.getElementById("order-items");
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");

  try {
    // Hent kurv fra backend via session storage
    const response = await fetch("/api/cart");
    const data = await response.json();

    if (!data.success || !data.cart || data.cart.length === 0) {
      // Hvis kurven er tom, vis en tom besked
      orderItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
      subtotalElement.textContent = "DKK 0.00";
      totalElement.textContent = "DKK 0.00";
      return;
    }

    const cart = data.cart;
    sessionStorage.setItem("cart", JSON.stringify(cart));
    let subtotal = 0;

    // Ryd containeren før opdatering
    orderItemsContainer.innerHTML = "";

    // Loop gennem kurvens produkter og generer HTML
    cart.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("order-item");
      itemElement.innerHTML = `
          <div class="item-details">
            <p class="item-name">${item.productName}</p>
            <p class="item-quantity">Quantity: ${item.quantity}</p>
          </div>
          <div class="item-price">DKK ${(
            item.productPrice * item.quantity
          ).toFixed(2)}</div>
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
    orderItemsContainer.innerHTML =
      "<p>Unable to load cart. Please try again later.</p>";
    subtotalElement.textContent = "DKK 0.00";
    totalElement.textContent = "DKK 0.00";
  }
}

function storeSearch() {
  var inputElement = document.getElementById("searchInput"); // Henter input-elementet for søgning
  var resultsDiv = document.getElementById("searchResults"); // Henter div-elementet hvor søgeresultater vises

  var debounceTimerId;

  inputElement.addEventListener("input", function () {
    clearTimeout(debounceTimerId); // Stop den tidligere satte timer
    debounceTimerId = setTimeout(() => {
      var searchTerm = inputElement.value; // Gemmer den indtastede søgeværdi
      if (searchTerm.length > 1) {
        // Sikrer at der er mindst 2 tegn før søgning
        fetch("/api/store_search?searchTerm=" + searchTerm)
          .then((res) => res.json())
          .then((res) => {
            console.log("Frontend", res);
            displayResults(res);
          });
      } else {
        resultsDiv.innerHTML = ""; // Tømmer søgeresultater hvis søgeterm er for kort
      }
    }, 200); // Debounce tid på 200 millisekunder
  });
}

function displayResults(items) {
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  items.forEach((item) => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item"); // Tilføjer klasse til resultatdiv
    resultItem.textContent = item.storeName; // Sætter tekstindholdet til fødevarens navn
    resultItem.onclick = function () {
      selectItem(item);
    }; // Tilføjer funktion til at vælge element ved klik
    resultsContainer.appendChild(resultItem);
  });
}

function selectItem(item) {
  selectedItemData = {};
  document.getElementById("searchInput").value = item.storeName;

  // Tjek om `selectedItem` elementet findes
  const selectedItemElement = document.getElementById("selectedItem");
  if (selectedItemElement) {
    selectedItemElement.textContent = `Selected Item: ${item.storeName}`;
  } else {
    console.log('Element with ID "selectedItem" not found.');
  }

  document.getElementById("searchResults").innerHTML = "";

  sessionStorage.setItem("selectedStore", JSON.stringify(item.storeID));
  sessionStorage.setItem("selectedName", JSON.stringify(item.storeName));

  // Gemmer og returnerer data om det valgte element
  return (selectedItemData = {
    storeName: item.storeName,
    storeID: item.storeID,
    storeCountry: item.storeCountry,
    storeCity: item.storeCity,
    storeStreet: item.storeStreet,
    storeHouseNumber: item.storeHouseNumber,
  });
}

async function addToCart(productID, productName, productPrice) {
  try {
    // Send produktdata til backend for at opdatere kurven
    const response = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productID: productID,
        productName: productName,
        productPrice: productPrice,
        quantity: 1, // Standard til 1
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("Cart updated in backend:", result.cart);

      // Opdater sessionStorage med backendens seneste kurv
      sessionStorage.setItem("cart", JSON.stringify(result.cart));

      // Opdater badge for at vise det samlede antal varer
      updateCartBadge();

      // Feedback til brugeren
      alert(`${productName} blev tilføjet til kurven!`);
    } else {
      console.error("Failed to add to cart:", result.message);
      alert("Kunne ikke tilføje til kurven. Prøv igen.");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Der opstod en fejl. Prøv igen senere.");
  }
}
