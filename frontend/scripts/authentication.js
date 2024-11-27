document.addEventListener('DOMContentLoaded', () => {
    const verificationForm = document.querySelector('.verification-form');
    if (verificationForm) {
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const smsCode = document.getElementById('authentiacation').value;
            const user = JSON.parse(sessionStorage.getItem('user'));

            if (!user || !user.phone) {
                alert('User data is missing. Please log in or sign up again.');
                window.location.href = '/login';
                return;
            }

            try {
                console.log("Verification request sent for phone number:", user.phone);

                const response = await fetch('/api/sendVerificationCode', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phoneNumber: user.phone, code: smsCode }),
                });

                const result = await response.json();

                if (response.ok) {
                    console.log("Verification successful for user:", user.email);
                    alert('Verification successful!');
                    sessionStorage.setItem('isVerified', true);
                    window.location.href = '/';
                } else {
                    console.error("Verification failed:", result.message);
                    alert(result.message || 'Verification failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during verification:', error);
                alert('An unexpected error occurred. Please try again later.');
            }
        });
    }
});