function setupLoginForm() {
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
          
            // Check if the user is a master user and should skip verification
            if (result.skipVerification) {
              alert("Login successful! Welcome back.");
              window.location.href = "/"; // Redirect to home page for master user
              return;
            }
          
            // Handle regular user login with verification
            alert(
              "A verification code has been sent to your phone. Please enter the code to verify your phone number."
            );
            window.location.href = "/authentication"; // Redirect to verification page
          } else {
            // Handle login failure
            console.error("Login failed:", result.message);
            alert(result.message || "Login failed. Please try again.");
          }




        // if (response.ok) {
        //   console.log("Login successful for user:", result.user);
        //   if (result.exists) {
        //     alert("A verification code has been sent to your phone. Please enter the code to verify your phone number.");
        //     window.location.href = "/authentication"; // Omdiriger til verificeringssiden
        //   } else {
        //     console.error("User does not exist.");
        //     alert("User does not exist. Please try again.");
        //   }
        //   return result.exists;
        // } 
        // // // Gem brugerdata i sessionStorage
        // // sessionStorage.setItem('user', JSON.stringify(result.user));
        // // sessionStorage.setItem('isVerified', false); // Initial status - not verified
        // else {
        //   console.error("Login failed:", result.message);
        //   alert(result.message || "Login failed. Please try again.");
        
      } catch (error) {
        console.error("Error during login:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    });
}};
