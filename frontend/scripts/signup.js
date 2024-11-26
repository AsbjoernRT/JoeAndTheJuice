  document.querySelector('.login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Stop standardformsubmission
  
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
      // Send POST-request til backend
      console.log('formData:', formData);
      
      const response = await fetch('api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Hvis signup lykkes
        sessionStorage.setItem('user', JSON.stringify(result.user));
        alert('User created successfully!');
        window.location.href = '/'; // Omdiriger til login-siden
      } else {
        // Hvis signup fejler
        alert(result.message || 'Failed to create user. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  });