//Utils.js

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
4
  async function checkLoginStatus() {
    console.log("Checking login status...");
    try {
      const response = await fetch("/api/loginStatus");
      if (!response.ok) {
        console.error("Failed to check login status.");
        return false;
      }
      const data = await response.json();
      console.log("Login status:", data);
      return data.loggedIn === true;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
  