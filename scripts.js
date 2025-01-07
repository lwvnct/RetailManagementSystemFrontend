// API Endpoints
const signInApiUrl = 'http://localhost:1337/api/auth/local'; // SignIn API endpoint
const registerApiUrl = 'http://localhost:1337/api/auth/local/register'; // Register API endpoint

// Elements
const signInForm = document.getElementById('signInForm');
const registrationForm = document.getElementById('registrationForm');
const showRegistrationForm = document.getElementById('showRegistrationForm');
const showSignInForm = document.getElementById('showSignInForm');
const logoutButton = document.getElementById('logoutButton');

// Toggle between registration and sign-in forms
if (showRegistrationForm && showSignInForm) {
    showRegistrationForm.addEventListener('click', (e) => {
        e.preventDefault();
        signInForm.classList.add('d-none');
        registrationForm.classList.remove('d-none');
    });

    showSignInForm.addEventListener('click', (e) => {
        e.preventDefault();
        registrationForm.classList.add('d-none');
        signInForm.classList.remove('d-none');
    });
}

// Registration Form Submission
if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(registerApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration Successful! Redirecting to Sign In...');
                registrationForm.classList.add('d-none');
                signInForm.classList.remove('d-none');
            } else {
                alert(`Error: ${data.error?.message || 'Registration failed.'}`);
            }
        } catch (error) {
            console.error('Registration Error:', error);
            alert('An error occurred during registration.');
        }
    });
}

// Sign In Form Submission
if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('signInUsernameEmail').value;
        const password = document.getElementById('signInPassword').value;

        try {
            const response = await fetch(signInApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();
            if (response.ok) {
                // Check for admin credentials
                if ((identifier === 'admin' || identifier === 'admin@gmail.com') && password === 'admin12345') {
                    alert('Admin Sign In Successful! Redirecting to Admin Store List...');
                    localStorage.setItem('authToken', data.jwt); // Store JWT
                    localStorage.setItem('userId', data.user.id); // Store User ID
                    window.location.href = 'adminStoreList.html'; // Redirect to admin page
                } else {
                    alert('Sign In Successful! Redirecting to Store...');
                    localStorage.setItem('authToken', data.jwt); // Store JWT
                    localStorage.setItem('userId', data.user.id); // Store User ID
                    window.location.href = 'store.html'; // Redirect to store page
                }
            } else {
                alert(`Error: ${data.error?.message || 'Sign In failed.'}`);
            }
        } catch (error) {
            console.error('Sign In Error:', error);
            alert('An error occurred during sign-in.');
        }
    });
}

// Logout Functionality
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('authToken'); // Clear JWT
        localStorage.removeItem('userId'); // Clear User ID
        alert('Logged out successfully.');
        window.location.href = 'landingpage.html';
    });
}
