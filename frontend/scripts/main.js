//Main.js Controls all dom functions.
document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  // Definere routes og deres krav
  const routes = {
    "/signup": {
      requiresAuth: false,
      action: () => {
      
      },
    },
    "/authentication": {
      requiresAuth: false,
      action: () => {
        signUpFunction();
      },
    },
    "/": {
      requiresAuth: true, 
      action: () => {
        displayProducts();
      },
    },
    "/order": {
      requiresAuth: true,
      action: () => {
        displayProducts();
        productSearch();
      },
    },
    "/success": {
      requiresAuth: true,
      action: () => {
        if (sessionId) {
          console.log("Checkout session ID:", sessionId);
          verifyOrder(sessionId);
        }
      },
    },
    "/cart": {
      requiresAuth: true,
      action: () => {
        populateUserDetails();
        checkoutProducts();
        storeSearch();
        setupPayNowButton();
      },
    },
    "/login": {
      requiresAuth: false,
      action: () => {
        setupLoginForm(); 
      },
    }
  };

  const currentRoute = routes[path];

  if (currentRoute) {
    if (currentRoute.requiresAuth) {
      const isLoggedIn = await checkLoginStatus();
      if (!isLoggedIn) {
        window.location.href = '/login';
        return;
      }
    
      currentRoute.action();
    } else {
      currentRoute.action();
    }
  } else {
    console.warn(`No route handler defined for path: ${path}`);
  }

  setTimeout(updateCartBadge, 500);
});