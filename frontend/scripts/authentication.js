//autentifikation af bruger
async function signUpFunction() {
    const verificationForm = document.querySelector(".verification-form");
  
    const userInfo = await getUserInfo();
    
    if (!userInfo || !userInfo.info) {
        alert("Failed to retrieve user information. Please try again.");
        window.location.href = "/signup";
        return;
      }
  
    const phone = userInfo.info.phone;
  
    if (verificationForm) {
      verificationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
  
        const verificationCode = document.getElementById("authentication").value;
  
        try {
          // Sender verifikationskoden og telefonnummeret til backenden
          const response = await fetch("/api/checkVerificationCode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber: phone, code: verificationCode }),
          });
  
          const result = await response.json();
          
  
          if (response.ok && result.success) {
            
            if (userInfo.userExists === false) {
                
              // Verification successful, create user
              const createUserResponse = await fetch("/api/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(userInfo.info),
              });
  
              const createUserResult = await createUserResponse.json();
  
              if (createUserResponse.ok && createUserResult.success) {
                alert("Signup successful!");
                window.location.href = "/";
              } else {
                alert("Error creating user: " + createUserResult.message);
              }
            } else if (userInfo.userExists === true) {
                
              // Verification successful, log user in
              alert("Login successful!");
              window.location.href = "/";
            }
          } else {
            alert("Verification failed: " + result.message);
          }
        } catch (error) {
          console.error("Error verifying code:", error);
          alert("An error occurred during verification. Please try again.");
        }
      });
    } else {
        console.error("Verification form not found.");
      }
    };
  
    async function getUserInfo() {
        try {
          const response = await fetch("/api/getSignupInfo");
          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }
          const result = await response.json();
          return result;
        } catch (error) {
          console.error("Error fetching user info:", error);
          return null;
        }
      }
  
    // Funktion til at oprette brugeren
    async function signupUser(formData) {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        const result = await response.json();
  
        if (response.ok && result.success) {
          alert("Signup successful!");
        } else {
          console.error("Error during signup:", result.message);
          alert(result.message || "Signup failed.");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
