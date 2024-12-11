//autentifikation af bruger
async function signUpFunction() {
    const verificationForm = document.querySelector(".verification-form");
  
    const userInfo = await getUserInfo();
  
    if (!userInfo || !userInfo.info) {
        alert("Failed to retrieve user information. Please try again.");
        window.location.href = "/signup";
        return;
      }

    console.log("Brugerdata fundet i sessionen:", userInfo);

  
    const phone = userInfo.info.phone;
  
    if (verificationForm) {
      verificationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
  
        const verificationCode = document.getElementById("authentication").value;
  
        try {
          // Send verifikationskoden og telefonnummeret til backenden
          const response = await fetch("/api/checkVerificationCode", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber: phone, code: verificationCode }),
          });
  
          const result = await response.json();
          console.log("Verification result:", result, result.ok, result.success);
          
  
          if (response.ok && result.success) {
            console.log("Verification successful!", userInfo.info);
            
            if (userInfo.userExists === false) {
                console.log("Bruger eksisterer ikke, opretter bruger...");
                
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
                window.location.href = "/login";
              } else {
                alert("Error creating user: " + createUserResult.message);
              }
            } else if (userInfo.userExists === true) {
                console.log("Bruger eksisterer, logger ind...");
                
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
          console.log("Signup successful, user created:", result.user);
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
    // Fetch user data from the server and store in session storage

//   function checkLoginStatus() {
//     console.log("Checking login status...");
  
//     fetch("/api/loginStatus")
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to check login status");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         console.log("Login status:", data);
//         if (data.loggedIn) {
//           // Brugeren er logget ind
//           console.log("Bruger er logget ind");
//         } else {
//           // Brugeren er ikke logget ind
//           console.log("Bruger er ikke logget ind");
//           window.location.href = "/login";
//         }
//       })
//       .catch((error) => {
//         console.error("Fejl ved tjek af login status:", error);
//         window.location.href = "/login";
//       });
//   }
