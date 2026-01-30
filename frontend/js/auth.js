// ============================================
// AUTHENTICATION SYSTEM - Complete Implementation
// Handles login and signup functionality
// ============================================

class AuthenticationSystem {
    constructor() {
        this.API_URL = '/api/auth';
        this.DEMO_MODE = true; // Set to false when you have real OAuth credentials
        this.currentUser = this.loadUserFromStorage();
        this.init();
    }

    init() {
        // Detect which page we're on
        const currentPage = window.location.pathname.split('/').pop();

        if (currentPage.includes('login.html')) {
            this.initLoginPage();
        } else if (currentPage.includes('signup.html')) {
            this.initSignupPage();
        }

        // Initialize forms in modals on homepage
        if (currentPage === '' || currentPage === 'index.html' || currentPage.endsWith('/')) {
            this.initModals();
        }

        // Update header with user info if logged in
        this.updateUserInterface();
    }

    // ============================================
    // MODAL INITIALIZATION (Homepage)
    // ============================================
    initModals() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));

            const googleBtn = document.getElementById('googleLogin');
            const facebookBtn = document.getElementById('facebookLogin');

            if (googleBtn) googleBtn.addEventListener('click', () => this.handleGoogleLogin());
            if (facebookBtn) facebookBtn.addEventListener('click', () => this.handleFacebookLogin());
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));

            const googleSignupBtn = document.getElementById('googleSignup');
            const facebookSignupBtn = document.getElementById('facebookSignup');

            if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => this.handleGoogleSignup());
            if (facebookSignupBtn) facebookSignupBtn.addEventListener('click', () => this.handleFacebookSignup());

            // Monitor password field for strength indicator
            const passwordInput = signupForm.querySelector('input[name="password"]');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e));
            }
        }

        // Initialize Google Sign-In
        this.initializeGoogleSignIn();
    }

    // ============================================
    // LOGIN PAGE INITIALIZATION
    // ============================================
    initLoginPage() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Social login buttons
        const googleBtn = document.getElementById('googleLogin');
        const facebookBtn = document.getElementById('facebookLogin');

        if (googleBtn) googleBtn.addEventListener('click', () => this.handleGoogleLogin());
        if (facebookBtn) facebookBtn.addEventListener('click', () => this.handleFacebookLogin());

        // Initialize Google Sign-In
        this.initializeGoogleSignIn();

        // Check if user is already logged in
        if (this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    // ============================================
    // SIGNUP PAGE INITIALIZATION
    // ============================================
    initSignupPage() {
        const form = document.getElementById('signupForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Password strength indicator
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e));
        }

        // Confirm password validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('blur', (e) => this.validatePasswordMatch(e));
        }

        // Social signup buttons
        const googleBtn = document.getElementById('googleSignup');
        const facebookBtn = document.getElementById('facebookSignup');

        if (googleBtn) googleBtn.addEventListener('click', () => this.handleGoogleSignup());
        if (facebookBtn) facebookBtn.addEventListener('click', () => this.handleFacebookSignup());

        // Initialize Google Sign-In
        this.initializeGoogleSignIn();

        // Check if user is already logged in
        if (this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    // ============================================
    // LOGIN HANDLER
    // ============================================
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validate inputs
        if (!this.validateEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters');
            return;
        }

        try {
            const submitBtn = event.target.querySelector('.btn-login');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');

            const response = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save user and token
            this.saveUserToStorage({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                token: data.token
            });

            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            this.showSuccess('Login successful! Redirecting to dashboard...');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.showAlert(error.message || 'Login failed. Please try again.', 'danger');
        } finally {
            const submitBtn = event.target.querySelector('.btn-login');
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    // ============================================
    // SIGNUP HANDLER
    // ============================================
    async handleSignup(event) {
        event.preventDefault();
        // console.log('🔍 Signup form submitted');

        // Get form from the event to avoid ID conflicts with multiple forms
        const form = event.target;
        const firstName = form.querySelector('input[name="firstName"]').value.trim();
        const lastName = form.querySelector('input[name="lastName"]').value.trim();
        const email = form.querySelector('input[name="email"]').value.trim();
        const phone = form.querySelector('input[name="phone"]').value.trim();
        const password = form.querySelector('input[name="password"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        const country = form.querySelector('select[name="country"]').value;
        const termsAccepted = form.querySelector('input[name="terms"]').checked;

        // console.log('📝 Form data:', { firstName, lastName, email, phone, country });

        // Validate all fields
        if (!firstName) {
            this.showError(form, 'firstName', 'First name is required');
            return;
        }

        if (!lastName) {
            this.showError(form, 'lastName', 'Last name is required');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError(form, 'email', 'Please enter a valid email address');
            return;
        }

        if (password.length < 8) {
            this.showError(form, 'password', 'Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError(form, 'confirmPassword', 'Passwords do not match');
            return;
        }

        if (!country) {
            this.showError(form, 'country', 'Please select a country');
            return;
        }

        if (!termsAccepted) {
            this.showAlert('Please accept the terms and conditions', 'danger');
            return;
        }

        try {
            const submitBtn = event.target.querySelector('.btn-signup');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Creating Account...';

            // console.log('📤 Sending signup request to:', `${this.API_URL}/signup`);

            const response = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: `${firstName} ${lastName}`,
                    email: email,
                    password: password,
                    phone: phone,
                    country: country
                })
            });

            // console.log('📥 Response status:', response.status);

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If not JSON, it might be HTML (error page)
                const text = await response.text();
                console.error('❌ Server returned non-JSON response:', text.substring(0, 100));
                throw new Error('Server error: Invalid response format. Backend API may not be running.');
            }

            // console.log('📥 Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Save user to storage
            const newUser = {
                name: `${firstName} ${lastName}`,
                email: email,
                phone: phone,
                country: country,
                createdAt: new Date().toISOString(),
                id: data.user?.id || Date.now()
            };

            this.currentUser = newUser;
            this.saveUserToStorage(newUser);

            // console.log('✅ Account created successfully!');
            this.showAlert('✅ Account created! Redirecting to your dashboard...', 'success');

            // Close signup modal and redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Signup error:', error);
            console.error('Error details:', error.message);

            // If it's a network error or API not responding, offer local signup
            if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
                console.error('⚠️ Backend API not responding. Using local signup mode.');
                const newUser = {
                    name: `${firstName} ${lastName}`,
                    email: email,
                    phone: phone,
                    country: country,
                    createdAt: new Date().toISOString(),
                    id: Date.now()
                };

                this.currentUser = newUser;
                this.saveUserToStorage(newUser);
                this.showAlert('✅ Account created locally! Redirecting to dashboard...', 'success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showAlert(error.message || 'Signup failed. Please try again.', 'danger');
            }
        } finally {
            const submitBtn = event.target.querySelector('.btn-signup');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Create Account';
            }
        }
    }

    // ============================================
    // VALIDATION FUNCTIONS
    // ============================================
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkPasswordStrength(event) {
        const password = event.target.value;
        const strengthBar = event.target.parentElement.querySelector('.strength-bar-fill');
        const strengthText = event.target.parentElement.querySelector('#strengthText');

        let strength = 'Weak';
        let strengthClass = 'weak';

        if (password.length >= 8) {
            if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
                if (/[!@#$%^&*]/.test(password)) {
                    strength = 'Very Strong';
                    strengthClass = 'strong';
                } else {
                    strength = 'Strong';
                    strengthClass = 'strong';
                }
            } else if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
                strength = 'Medium';
                strengthClass = 'medium';
            }
        }

        strengthBar.className = 'strength-bar-fill ' + strengthClass;
        strengthText.textContent = 'Password strength: ' + strength;
    }

    validatePasswordMatch(event) {
        const password = document.getElementById('password').value;
        const confirmPassword = event.target.value;

        if (confirmPassword && password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
        } else {
            this.clearError('confirmPassword');
        }
    }

    // ============================================
    // SOCIAL LOGIN (Placeholder)
    // ============================================
    // GOOGLE & FACEBOOK OAUTH
    // ============================================

    // Initialize Google Sign-In
    initializeGoogleSignIn() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with your Google Client ID
                callback: (response) => this.handleGoogleResponse(response),
                error_callback: () => this.showAlert('Google Sign-In failed. Please try again.', 'danger')
            });
        }
    }

    // Handle Google Sign-In Response
    handleGoogleResponse(response) {
        const token = response.credential;

        // Decode JWT token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);

        this.processGoogleSignup(userData, token);
    }

    // Process Google Signup
    async processGoogleSignup(userData, token) {
        try {
            // Create user data from Google response
            const newUser = {
                firstName: userData.given_name || '',
                lastName: userData.family_name || '',
                email: userData.email,
                avatar: userData.picture,
                provider: 'google',
                providerId: userData.sub,
                phone: '',
                country: 'NG',
                createdAt: new Date().toISOString()
            };

            // Try to send to backend
            try {
                const response = await fetch(`${this.API_URL}/google-signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: newUser,
                        token: token
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.currentUser = result.user;
                    this.saveUserToStorage(result.user);
                    this.showAlert('Google signup successful!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                } else {
                    throw new Error('Backend error');
                }
            } catch (error) {
                // Fallback: Save locally if backend is not available
                // console.log('Backend not available, saving locally');
                this.currentUser = newUser;
                this.saveUserToStorage(newUser);
                this.showAlert('Signed up with Google successfully!', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            }
        } catch (error) {
            console.error('Google signup error:', error);
            this.showAlert('Error during Google signup. Please try again.', 'danger');
        }
    }

    // Handle Google Signup
    handleGoogleSignup() {
        // Check if Google SDK is loaded
        if (!window.google || !window.google.accounts) {
            this.showAlert(
                '⚠️ Google OAuth not configured yet. You can still sign up using email and password below. To set up Google Sign-Up, visit the homepage and check the browser console for setup instructions.',
                'warning'
            );
            console.warn('🔧 Google OAuth Setup Instructions:');
            console.warn('1. Go to https://console.cloud.google.com');
            console.warn('2. Create a new project and configure OAuth credentials');
            console.warn('3. Copy your Client ID');
            console.warn('4. Replace "YOUR_GOOGLE_CLIENT_ID" in auth.js line 341');
            console.warn('5. Refresh the page');
            return;
        }

        // Try to trigger Google One Tap or sign-in flow
        try {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.warn('Google One Tap not displayed. Client ID may not be configured.');
                }
            });
        } catch (error) {
            console.error('Google signup error:', error);
            this.showAlert('⚠️ Google Sign-Up configuration issue. Please sign up with email and password, or check the console for setup instructions.', 'warning');
        }
    }

    // Handle Facebook Signup
    handleFacebookSignup() {
        if (this.DEMO_MODE) {
            const demoUser = {
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@facebook.com',
                avatar: 'https://via.placeholder.com/150',
                provider: 'facebook',
                providerId: 'demo-facebook-123',
                phone: '',
                country: 'NG',
                createdAt: new Date().toISOString()
            };
            this.currentUser = demoUser;
            this.saveUserToStorage(demoUser);
            this.showAlert('Signed up with Facebook (Demo Mode)!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }

        // Initialize Facebook SDK if not already done
        if (typeof FB !== 'undefined') {
            FB.login((response) => {
                if (response.authResponse) {
                    this.processFacebookSignup(response.authResponse);
                } else {
                    this.showAlert('Facebook login cancelled.', 'danger');
                }
            }, { scope: 'public_profile,email' });
        } else {
            this.showAlert('Facebook SDK not loaded. Please try again.', 'danger');
        }
    }

    // Process Facebook Signup
    async processFacebookSignup(authResponse) {
        try {
            // Get user data from Facebook
            FB.api('/me', { fields: 'id,name,email,picture,first_name,last_name' }, async (response) => {
                const newUser = {
                    firstName: response.first_name || '',
                    lastName: response.last_name || '',
                    email: response.email || '',
                    avatar: response.picture?.data?.url || '',
                    provider: 'facebook',
                    providerId: response.id,
                    phone: '',
                    country: 'NG',
                    createdAt: new Date().toISOString()
                };

                // Try to send to backend
                try {
                    const apiResponse = await fetch(`${this.API_URL}/facebook-signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user: newUser,
                            accessToken: authResponse.accessToken
                        })
                    });

                    if (apiResponse.ok) {
                        const result = await apiResponse.json();
                        this.currentUser = result.user;
                        this.saveUserToStorage(result.user);
                        this.showAlert('Facebook signup successful!', 'success');
                        setTimeout(() => window.location.href = 'index.html', 1500);
                    } else {
                        throw new Error('Backend error');
                    }
                } catch (error) {
                    // Fallback: Save locally if backend is not available
                    // console.log('Backend not available, saving locally');
                    this.currentUser = newUser;
                    this.saveUserToStorage(newUser);
                    this.showAlert('Signed up with Facebook successfully!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                }
            });
        } catch (error) {
            console.error('Facebook signup error:', error);
            this.showAlert('Error during Facebook signup. Please try again.', 'danger');
        }
    }

    // Legacy social login method (fallback)
    socialLogin(provider) {
        // console.log(`Social login with ${provider}`);

        if (provider === 'google') {
            this.handleGoogleLogin();
        } else if (provider === 'facebook') {
            this.handleFacebookLogin();
        }
    }

    // Handle Google Login
    handleGoogleLogin() {
        // Check if Google SDK is loaded
        if (!window.google || !window.google.accounts) {
            this.showAlert(
                '⚠️ Google OAuth not configured yet. Please log in using your email and password. To set up Google Sign-In, check the browser console for setup instructions.',
                'warning'
            );
            console.warn('🔧 Google OAuth Setup Instructions:');
            console.warn('1. Go to https://console.cloud.google.com');
            console.warn('2. Create a new project and configure OAuth credentials');
            console.warn('3. Copy your Client ID');
            console.warn('4. Replace "YOUR_GOOGLE_CLIENT_ID" in auth.js line 341');
            console.warn('5. Refresh the page');
            return;
        }

        // Try to trigger Google One Tap or sign-in flow
        try {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.warn('Google One Tap not displayed. Client ID may not be configured.');
                }
            });
        } catch (error) {
            console.error('Google login error:', error);
            this.showAlert('⚠️ Google Sign-In configuration issue. Please log in with email and password, or check the console for setup instructions.', 'warning');
        }
    }

    // Process Google Login Response
    async processGoogleLogin(userData, token) {
        try {
            // Try to send to backend
            try {
                const response = await fetch(`${this.API_URL}/google-login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: userData.email,
                        provider: 'google',
                        providerId: userData.sub,
                        token: token
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    this.currentUser = result.user;
                    this.saveUserToStorage(result.user);
                    this.showAlert('Google login successful!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                } else {
                    throw new Error('Backend error');
                }
            } catch (error) {
                // Fallback: Create local user if backend is not available
                console.warn('Backend not available, logging in locally');
                const localUser = {
                    email: userData.email,
                    firstName: userData.given_name || '',
                    lastName: userData.family_name || '',
                    avatar: userData.picture,
                    provider: 'google',
                    providerId: userData.sub
                };
                this.currentUser = localUser;
                this.saveUserToStorage(localUser);
                this.showAlert('Logged in with Google!', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            }
        } catch (error) {
            console.error('Google login error:', error);
            this.showAlert('Error during Google login. Please try again.', 'danger');
        }
    }

    // Handle Facebook Login
    handleFacebookLogin() {
        if (this.DEMO_MODE) {
            const demoUser = {
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@facebook.com',
                avatar: 'https://via.placeholder.com/150',
                provider: 'facebook',
                providerId: 'demo-facebook-123'
            };
            this.currentUser = demoUser;
            this.saveUserToStorage(demoUser);
            this.showAlert('Logged in with Facebook (Demo Mode)!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return;
        }

        if (typeof FB !== 'undefined') {
            FB.login((response) => {
                if (response.authResponse) {
                    this.processFacebookLogin(response.authResponse);
                } else {
                    this.showAlert('Facebook login cancelled.', 'danger');
                }
            }, { scope: 'public_profile,email' });
        } else {
            this.showAlert('Facebook SDK not loaded. Please try again.', 'danger');
        }
    }

    // Process Facebook Login Response
    async processFacebookLogin(authResponse) {
        try {
            FB.api('/me', { fields: 'id,name,email,picture,first_name,last_name' }, async (response) => {
                try {
                    const apiResponse = await fetch(`${this.API_URL}/facebook-login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: response.email,
                            provider: 'facebook',
                            providerId: response.id,
                            accessToken: authResponse.accessToken
                        })
                    });

                    if (apiResponse.ok) {
                        const result = await apiResponse.json();
                        this.currentUser = result.user;
                        this.saveUserToStorage(result.user);
                        this.showAlert('Facebook login successful!', 'success');
                        setTimeout(() => window.location.href = 'index.html', 1500);
                    } else {
                        throw new Error('Backend error');
                    }
                } catch (error) {
                    // Fallback: Create local user if backend is not available
                    console.warn('Backend not available, logging in locally');
                    const localUser = {
                        email: response.email,
                        firstName: response.first_name || '',
                        lastName: response.last_name || '',
                        avatar: response.picture?.data?.url || '',
                        provider: 'facebook',
                        providerId: response.id
                    };
                    this.currentUser = localUser;
                    this.saveUserToStorage(localUser);
                    this.showAlert('Logged in with Facebook!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1500);
                }
            });
        } catch (error) {
            console.error('Facebook login error:', error);
            this.showAlert('Error during Facebook login. Please try again.', 'danger');
        }
    }

    // ============================================
    // ERROR/SUCCESS HANDLING
    // ============================================
    showError(formOrFieldId, messageOrFieldId, message) {
        // Support both old and new calling conventions
        let field;
        let errorMessage = message;

        if (typeof formOrFieldId === 'string') {
            // Old way: showError(fieldId, message)
            field = document.getElementById(formOrFieldId);
            errorMessage = messageOrFieldId;
        } else {
            // New way: showError(form, fieldId, message)
            field = formOrFieldId.querySelector(`[name="${messageOrFieldId}"]`);
            errorMessage = message;
        }

        if (field) {
            field.classList.add('error');
            const errorDiv = field.parentElement.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.textContent = errorMessage;
                errorDiv.style.display = 'block';
            }
        }
    }

    clearError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('error');
            const errorDiv = field.parentElement.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }
    }

    showAlert(message, type) {
        // Find alertBox in visible modal
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');

        let alertBox = null;

        // Check which modal is visible and get its alert box
        if (loginModal && loginModal.style.display !== 'none' && loginModal.style.display !== '') {
            alertBox = document.getElementById('loginAlertBox');
        } else if (signupModal && signupModal.style.display !== 'none' && signupModal.style.display !== '') {
            alertBox = document.getElementById('signupAlertBox');
        }

        // Fallback to first available alert box
        if (!alertBox) {
            alertBox = document.getElementById('loginAlertBox') || document.getElementById('signupAlertBox') || document.querySelector('.alert');
        }

        if (alertBox) {
            alertBox.textContent = message;
            alertBox.className = `alert show alert-${type}`;
            alertBox.style.display = 'block';

            // Auto-hide success/warning messages after 5 seconds
            if (type !== 'danger') {
                setTimeout(() => {
                    if (alertBox) {
                        alertBox.style.display = 'none';
                        alertBox.className = 'alert';
                    }
                }, 5000);
            }
        } else {
            console.warn('Alert box not found, logging message:', message);
        }
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    // ============================================
    // USER STORAGE MANAGEMENT
    // ============================================
    saveUserToStorage(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    loadUserFromStorage() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    // ============================================
    // USER INTERFACE UPDATES
    // ============================================
    updateUserInterface() {
        const userMenuNav = document.getElementById('userMenuNav');
        const userMenuTrigger = document.getElementById('userMenuTrigger');
        const loginBtn = document.querySelector('.btn-login-nav');
        const signupBtn = document.querySelector('.btn-signup-nav');

        if (this.currentUser) {
            // Show dashboard link in navbar
            if (userMenuNav) {
                userMenuNav.style.display = 'block';
            }
            if (userMenuTrigger) {
                userMenuTrigger.style.display = 'block';
            }

            // Hide login and signup buttons
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }
            if (signupBtn) {
                signupBtn.style.display = 'none';
            }

            // console.log('✅ User logged in:', this.currentUser.name);
        } else {
            // Hide dashboard link when not logged in
            if (userMenuNav) {
                userMenuNav.style.display = 'none';
            }
            if (userMenuTrigger) {
                userMenuTrigger.style.display = 'none';
            }

            // Show login and signup buttons
            if (loginBtn) {
                loginBtn.style.display = 'inline-block';
            }
            if (signupBtn) {
                signupBtn.style.display = 'inline-block';
            }
        }
    }

    // ============================================
    // GET CURRENT USER & TOKEN
    // ============================================
    getCurrentUser() {
        return this.currentUser;
    }

    getAuthToken() {
        return this.currentUser ? this.currentUser.token : null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize authentication system
const authSystem = new AuthenticationSystem();

// Export for use in other modules
window.authSystem = authSystem;
window.logout = () => authSystem.logout();
