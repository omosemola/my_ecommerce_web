// Initialize Paystack
let paystackPublicKey = '';

// Fetch Paystack public key
async function initPaystack() {
    try {
        const response = await fetch('/api/paystack-public-key');
        const data = await response.json();
        paystackPublicKey = data.publicKey;
        console.log('✅ Paystack initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Paystack:', error);
    }
}

// Initialize checkout page after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPaystack();

    // Toggle Payment Sections
    const creditCardRadio = document.getElementById('credit-card');
    const transferRadio = document.getElementById('transfer');
    const stripeSection = document.getElementById('stripe-payment');
    const bankTrigger = document.getElementById('bank-transfer-trigger');
    const paymentBtn = document.getElementById('payment-btn');
    const modal = document.getElementById('paymentModal');
    const openModalBtn = document.getElementById('open-bank-modal-btn');

    function togglePaymentMethod() {
        if (transferRadio.checked) {
            stripeSection.style.display = 'none';
            bankTrigger.style.display = 'block';
            paymentBtn.style.display = 'none';
        } else {
            stripeSection.style.display = 'block';
            bankTrigger.style.display = 'none';
            paymentBtn.style.display = 'block';
        }
    }

    creditCardRadio.addEventListener('change', togglePaymentMethod);
    transferRadio.addEventListener('change', togglePaymentMethod);

    // Timer Logic
    let timerInterval;
    const timerDisplay = document.getElementById('payment-timer');

    function startTimer(duration) {
        let timer = duration, minutes, seconds;
        clearInterval(timerInterval); // Clear any existing

        timerInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            timerDisplay.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "00:00 (Expired)";
                timerDisplay.style.color = 'red';
            }
        }, 1000);
    }

    // Modal Functions
    window.closePaymentModal = function () {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
        clearInterval(timerInterval); // Stop timer
    }

    openModalBtn.addEventListener('click', () => {
        if (!document.getElementById('terms').checked) {
            alert('Please agree to the Terms & Conditions before paying.');
            return;
        }
        const totalText = document.getElementById('total').textContent;
        document.getElementById('modal-total-amount').textContent = totalText;
        console.log('Opening Payment Modal');
        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('active'); }, 10);
        startTimer(90);
    });

    // Handle "I've sent the money" button
    const sentMoneyBtn = document.getElementById('sent-money-btn');
    sentMoneyBtn.addEventListener('click', async () => {
        if (confirm('Have you transferred the exact amount to the account provided?')) {
            window.cartManager.clearCart();
            window.cartManager.showNotification('Payment Confirmed! Order Placed.', 'success');
            closePaymentModal();
            setTimeout(() => {
                const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
                const email = document.getElementById('email').value;
                window.location.href = `order-success.html?orderId=${orderId}&email=${encodeURIComponent(email)}`;
            }, 1500);
        }
    });

    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutCartManager = window.cartManager;

    // Load order summary on page load
    function loadOrderSummary() {
        const checkoutItems = document.getElementById('checkout-items');
        if (!checkoutCartManager.getCart() || checkoutCartManager.getCart().length === 0) {
            checkoutItems.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No items in cart</td></tr>';
            document.getElementById('subtotal').textContent = '₦0.00';
            document.getElementById('shipping').textContent = '₦0.00';
            document.getElementById('tax').textContent = '₦0.00';
            document.getElementById('total').textContent = '₦0.00';
            return;
        }
        checkoutItems.innerHTML = checkoutCartManager.getCart().map(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            return `
                <tr>
                    <td data-label="Product">${item.name}</td>
                    <td data-label="Quantity">${item.quantity}</td>
                    <td data-label="Price">₦${item.price.toFixed(2)}</td>
                    <td data-label="Subtotal">₦${itemTotal}</td>
                </tr>
            `;
        }).join('');
        updateTotals();
    }

    function updateTotals() {
        const subtotal = checkoutCartManager.getCartTotal();
        const shipping = subtotal > 100 ? 0 : 10;
        const tax = (subtotal * 0.08).toFixed(2);
        const total = (subtotal + shipping + parseFloat(tax)).toFixed(2);

        document.getElementById('subtotal').textContent = `₦${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `₦${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `₦${tax}`;
        document.getElementById('total').textContent = `₦${total}`;
    }

    // PAYSTACK PAYMENT HANDLER
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // DEBUGGING: Trace the flow
        alert('Payment Button Clicked!');

        if (!document.getElementById('terms').checked) {
            alert('Please agree to the Terms & Conditions');
            return;
        }

        console.log('Terms checked. Checking Paystack key...');

        if (!paystackPublicKey) {
            alert('Error: Paystack Key is missing! Please refresh.');
            return;
        }

        alert('Paystack Key Check Passed: ' + paystackPublicKey);

        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing Paystack...';

        try {
            alert('Preparing Payment Data...');
            // Collect Data
            const formData = new FormData(checkoutForm);
            const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('₦', ''));
            const shipping = parseFloat(document.getElementById('shipping').textContent.replace('₦', ''));
            const tax = parseFloat(document.getElementById('tax').textContent.replace('₦', ''));
            const total = parseFloat(document.getElementById('total').textContent.replace('₦', ''));

            const email = formData.get('email');
            const amountKobo = Math.round(total * 100);

            const orderData = {
                customer: {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: email,
                    phone: formData.get('phone')
                },
                shipping: {
                    address: formData.get('address'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zip: formData.get('zip'),
                    country: formData.get('country')
                },
                items: checkoutCartManager.getCart(),
                total: total,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax
            };

            // Initialize Paystack Popup
            const handler = PaystackPop.setup({
                key: paystackPublicKey,
                email: email,
                amount: amountKobo,
                currency: 'NGN',
                ref: 'PSK_' + Math.floor((Math.random() * 1000000000) + 1),
                firstname: formData.get('firstName'),
                lastname: formData.get('lastName'),
                metadata: {
                    custom_fields: [
                        {
                            display_name: "Mobile Number",
                            variable_name: "mobile_number",
                            value: formData.get('phone')
                        }
                    ]
                },
                onClose: function () {
                    alert('Transaction was not completed, window closed.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                },
                callback: async function (response) {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying Payment...';

                    // Verify Payment on Backend
                    try {
                        const verifyResponse = await fetch('/api/paystack/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                reference: response.reference,
                                orderData: orderData,
                                items: orderData.items,
                                total: orderData.total
                            })
                        });

                        const result = await verifyResponse.json();

                        if (result.success) {
                            console.log('✅ Order placed successfully:', result.orderId);
                            checkoutCartManager.clearCart();
                            window.location.href = `order-success.html?orderId=${result.orderId}&email=${encodeURIComponent(email)}`;
                        } else {
                            throw new Error(result.error || 'Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification Error:', err);
                        alert('Payment verification failed: ' + err.message);
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                }
            });

            alert('Opening Paystack Popup...');
            handler.openIframe();

        } catch (error) {
            console.error('Checkout Error:', error);
            alert('Error: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    loadOrderSummary();
});
