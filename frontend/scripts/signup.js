document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector(".signup-form");
  
    if (signupForm) {
      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
  
        // Hent data fra formularen
        const formData = {
          firstName: document.getElementById("firstName").value.trim(),
          lastName: document.getElementById("lastName").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
          confirmPassword: document.getElementById("confirmPassword").value,
          phone: document.getElementById("phone").value.trim(),
          country: document.getElementById("country").value.trim(),
          city: document.getElementById("city").value.trim(),
          postNumber: document.getElementById("postNumber").value.trim(),
          street: document.getElementById("street").value.trim(),
          houseNumber: document.getElementById("houseNumber").value.trim(),
        };
  
        // Valider nødvendige felter
        if (!validateSignupForm(formData)) {
          return; // Stop processen, hvis validering fejler
        }
  
        // Tjek om brugeren allerede eksisterer
        const userExists = await checkUserExists(formData.email);
  
        if (!userExists) {
          // Send verificeringskode til brugerens telefonnummer
          const codeSent = await sendAuthCode(formData.phone);
  
          if (codeSent) {
            // Gem formData midlertidigt på serveren
            const initiationResult = await initiateSignup(formData);
  
            if (initiationResult.success) {
              // Redirect til authentication-siden
              window.location.href = `/authentication`;
            } else {
              alert("Error initiating signup: " + initiationResult.message);
            }
          } else {
            alert("Failed to send verification code. Please try again.");
          }
        } else {
          alert("User already exists.");
        }
      });
    }
  });
  
  // Funktion til validering af nødvendige felter
  function validateSignupForm(formData) {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "phone",
      "country",
      "city",
      "postNumber",
      "street",
      "houseNumber",
    ];
  
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`The field "${field}" is required.`);
        return false; // Stop validering, hvis et felt mangler
      }
    }
  
    // Ekstra validering for specifikke felter
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }
  
    if (formData.password.length < 1) {
      alert("Password must be at least 8 characters long.");
      return false;
    }
  
    if (!/^\d+$/.test(formData.phone)) {
      alert("Phone number must contain only digits.");
      return false;
    }
  
    // Valider, at passwords matcher
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return false;
    }
  
    return true; // Alle felter er valide
  }
  
  // Funktion til at validere e-mail
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Funktion til at checke om bruger findes i databasen
  async function checkUserExists(email) {
    try {
      const response = await fetch("/api/checkUserExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false; // Antag at brugeren ikke eksisterer ved fejl
    }
  }
  
  // Funktion til at initiere signup-processen
  async function initiateSignup(formData) {
    try {
      const response = await fetch("/api/sessionInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error initiating signup:", error);
      return {
        success: false,
        message: "An error occurred during signup initiation.",
      };
    }
  }
  
  // Funktion til at sende verificeringskode
  async function sendAuthCode(phoneNumber) {
    try {
      // Send verificeringskode via backend
      const verificationResponse = await fetch("/api/sendVerificationCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });
  
      const verificationResult = await verificationResponse.json();
  
      if (verificationResult.success === true) {
        console.log("Verification code sent successfully to:", phoneNumber);
        alert(
          "A verification code has been sent to your phone. Please enter the code to verify your phone number."
        );
        return true;
      } else {
        console.error(
          "Failed to send verification code:",
          verificationResult.message
        );
        alert(
          verificationResult.message || "Failed to send verification code."
        );
        return false;
      }
    } catch (error) {
      console.error("Error during verification:", error);
      alert("An unexpected error occurred. Please try again later.");
      return false;
    }
  }