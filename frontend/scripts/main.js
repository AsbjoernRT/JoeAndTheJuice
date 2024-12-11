//Main.js Controls all dom functions.
document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;
  console.log(`Current path: ${path}`);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  // Define routes and their requirements
  const routes = {
    "/signup": {
      requiresAuth: false,
      action: () => {
        // Ryk signup logik herind.
      
      },
    },
    "/authentication": {
      requiresAuth: false,
      action: () => {
        // Ryk authentication logik herind.
        signUpFunction();
      },
    },
    "/": {
      requiresAuth: true, // Home page requires login in this scenario
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
        // Login page logic
      },
    }
  };

  const currentRoute = routes[path];

  // If the route is defined
  if (currentRoute) {
    // Check authentication requirement
    if (currentRoute.requiresAuth) {
      const loggedIn = await checkLoginStatus();
      if (!loggedIn) {
        // If not logged in and route requires auth, redirect to login
        console.log("User not logged in, redirecting to /login");
        window.location.href = "/login";
        return;
      }
      // If logged in, proceed
      currentRoute.action();
    } else {
      // If no auth required, run action directly
      currentRoute.action();
    }
  } else {
    console.warn(`No route handler defined for path: ${path}`);
    // Optionally load a default page or 404 here
  }

  // Update the cart badge on every page load
  setTimeout(updateCartBadge, 500);
});