document.addEventListener("DOMContentLoaded", () => {
  // Login-form handling
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Forhindrer standard GET-request

      // Hent input-værdier
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        console.log("Login request sent for email:", email);

        // Send login-data som POST-request
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log("Login successful for user:", result.user);

          // Funktion til at checke om bruger findes i databasen
            try {
              const response = await fetch("/api/checkUserExists", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
              });

              const result = await response.json();
              if (result.exists) {
                alert("A verification code has been sent to your phone. Please enter the code to verify your phone number.");
                window.location.href = "/authentication"; // Omdiriger til verificeringssiden
              } else {
                console.error("User does not exist.");
                alert("User does not exist. Please try again.");
              }
              return result.exists;
            } catch (error) {
              console.error("Error checking user existence:", error);
              return false; // Antag at brugeren ikke eksisterer ved fejl
            }
          // // Gem brugerdata i sessionStorage
          // sessionStorage.setItem('user', JSON.stringify(result.user));
          // sessionStorage.setItem('isVerified', false); // Initial status - not verified
        } else {
          console.error("Login failed:", result.message);
          alert(result.message || "Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    });
}});
