document.addEventListener('DOMContentLoaded', () => {
  // Signup-form handling
  const signupForm = document.querySelector('.login-form'); // Sørg for at formen har en unik klasse eller ID

  if (signupForm) {
      signupForm.addEventListener('submit', async (event) => {
          event.preventDefault(); // Stop standard form submission

          // Valider, at passwords matcher
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;

          if (password !== confirmPassword) {
              alert('Passwords do not match!');
              return;
          }

          // Hent data fra formularen
          const formData = {
              firstName: document.getElementById('firstName').value,
              lastName: document.getElementById('lastName').value,
              email: document.getElementById('email').value,
              password: document.getElementById('password').value,
              phone: document.getElementById('phone').value,
              country: document.getElementById('country').value,
              city: document.getElementById('city').value,
              postNumber: document.getElementById('postNumber').value,
              street: document.getElementById('street').value,
              houseNumber: document.getElementById('houseNumber').value,
          };

          try {
              console.log('SignUp request sent with formData:', formData);

              // Send POST-request til backend for at oprette brugeren
              const response = await fetch('/api/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(formData),
              });

              const result = await response.json();

              if (response.ok) {
                  console.log('Signup successful, user created:', result.user);

                  // Gem brugerdata i sessionStorage
                  sessionStorage.setItem('user', JSON.stringify(result.user));

                  // Send verificeringskode via Twilio
                  const verificationResponse = await fetch('/api/sendVerificationCodeSignUp', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ phoneNumber: result.user.phone }),
                  });

                  const verificationResult = await verificationResponse.json();

                  if (verificationResponse.ok) {
                      console.log('Verification code sent successfully to:', result.user.phone);
                      alert('User created successfully! A verification code has been sent to your phone.');

                      // Omdiriger til authentication-siden
                      window.location.href = '/authentication';
                  } else {
                      console.error('Failed to send verification code:', verificationResult.message);
                      alert(verificationResult.message || 'Failed to send verification code.');
                  }
              } else {
                  // Hvis signup fejler
                  alert(result.message || 'Failed to create user. Please try again.');
              }
          } catch (error) {
              console.error('Error during signup:', error);
              alert('An unexpected error occurred. Please try again later.');
          }
      });
  }
});