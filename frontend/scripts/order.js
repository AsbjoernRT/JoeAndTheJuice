//Order.js

// Cart management
async function addToCart(productID, productName, productPrice) {
  try {
    // Send produktdata til backend for at opdatere kurven
    const response = await fetchWithAuth("/api/cart/add", {
      method: "POST",
    //   credentials: "include",
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

// Checkout management
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

async function verifyOrder(sessionId) {
  try {
    const response = await fetch("/api/order", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const result = await response.json();
  } catch (error) {
    console.error("Error verifying order:", error);
  }
}

// Create Checkout Session
// checkout.js

async function populateUserDetails() {
  try {
    // Fetch user data from the server
    const userData = await fetchUserData();
    if (!userData) return;

    // Populate the form with user data
    populateFormFields(userData);

  } catch (error) {
    console.error("Error populating user details:", error);
  }
}

async function fetchUserData() {
  try {
    const response = await fetch("/api/userData", {
      credentials: "include",
    });
    const data = await response.json();

    if (data.success && data.user) {
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
    return;
  }

  const formFields = [{ id: "email", value: userData.email }];

  formFields.forEach(({ id, value }) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = value || "";
    } else {
      console.warn(`Element with ID "${id}" not found.`);
    }
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = userData.selectedStore || "";
  }
}

async function handlePayNowClick(event) {
  event.preventDefault();

  try {
    const userData = await fetchUserData();
    if (!userData || !userData.userId) {
      alert("User is not logged in. Please log in to proceed.");
      return;
    }

    const userID = userData.userId;
    const storeID = parseInt(sessionStorage.getItem("selectedStore"), 10);
    if (!storeID) {
      alert("Please select a store before proceeding.");
      return;
    }

    const storeName = sessionStorage.getItem("selectedName");
    const cartData = JSON.parse(sessionStorage.getItem("cart"));
    if (!cartData || cartData.length === 0) {
      alert("No products found in the cart. Please try again.");
      return;
    }

    const products = cartData.map((item) => ({
      productID: item.productID,
      quantity: item.quantity,
    }));

    if (products.length === 0) {
      alert("No valid products found in the cart.");
      return;
    }

    const payload = { userID, storeID, storeName, products };

    const response = await fetch("api/checkout", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      window.location.href = result.url; // Stripe checkout redirect
    } else {
      console.error("Error creating checkout session:", result.message);
      alert("An error occurred while creating the checkout session.");
    }
  } catch (error) {
    console.error("Error placing order:", error);
    alert("An error occurred while placing the order. Please try again later.");
  }
}

// A function to set up the event listener
function setupPayNowButton() {
  const payNowButton = document.getElementById("pay-now");
  if (payNowButton) {
    payNowButton.removeEventListener("click", handlePayNowClick); // ensure no double binding
    payNowButton.addEventListener("click", handlePayNowClick);
  }
}
