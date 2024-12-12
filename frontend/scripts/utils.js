//Utils.js
async function fetchWithAuth(url, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  
    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",  // Include cookies automatically
        headers,
      });
  
      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }
  
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "An unknown error occurred.",
        }));
        throw new Error(error.message || "Request failed.");
      }
  
      return response;
    } catch (error) {
      console.error("Fetch error:", error);
      throw new Error("Network error. Please try again.");
    }
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

  
  async function checkLoginStatus() {
    console.log("Checking login status...");
    try {
      const response = await fetch('/api/loginStatus', {
        credentials: 'include' // Ensure cookies are sent
      });
      if (!response.ok) {
        console.error("Failed to check login status.");
        return false;
      }
      const data = await response.json();
      console.log("Login status:", data);
      return data.loggedIn;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
  