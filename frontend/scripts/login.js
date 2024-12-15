function setupLoginForm() {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Forhindrer standard GET-request

      // Hent input-værdier
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
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
          
            // Checker om brugeren er masterbrugeren, så vi kan skippe to-faktor-verificering
            if (result.skipVerification) {
              alert("Login successful! Welcome back.");
              window.location.href = "/";
              return;
            }
          
            // Håndter user login med verificering
            alert(
              "A verification code has been sent to your phone. Please enter the code to verify your phone number."
            );
            window.location.href = "/authentication"; // Redirect to verification page
          } else {
            // Handle login failure
            console.error("Login failed:", result.message);
            alert(result.message || "Login failed. Please try again.");
          }
        
      } catch (error) {
        console.error("Error during login:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    });
}};
