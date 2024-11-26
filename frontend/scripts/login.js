// Login-form handling
document.addEventListener('DOMContentLoaded', () => {
    // Find login-formularen
    const loginForm = document.querySelector('.login-form');

    // Tilføj event listener til formularen
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Forhindrer standard GET-request

        // Hent input-værdier
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Send login-data som POST-request
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                // Login succesfuldt
                alert('Login successful!');
                window.location.href = '/'; // Omdiriger til dashboard eller startside
            } else {
                // Fejl i login
                alert(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
});