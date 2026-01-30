// Example: Add to your contact.html or create a form page
// This demonstrates how to add login/register forms and cart button

const contactFormExample = `
<!-- Login Form Example (add to your HTML) -->
<div id="auth-container">
  <form id="login-form">
    <input type="email" placeholder="Email" required>
    <input type="password" placeholder="Password" required>
    <button type="submit">Login</button>
  </form>

  <form id="register-form" style="display:none;">
    <input type="text" placeholder="Full Name" required>
    <input type="email" placeholder="Email" required>
    <input type="password" placeholder="Password" required>
    <button type="submit">Register</button>
  </form>
</div>

<!-- Cart Button (add to your navbar) -->
<span id="cart-count" style="background:red; color:white; padding:5px 10px; border-radius:50%;">0</span>

<!-- Cart Display (add to cart.html) -->
<div id="cart-items"></div>
<div id="cart-total"></div>
<button onclick="cart.checkout()">Checkout</button>
`;

// Event listeners for forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const [email, password] = e.target.querySelectorAll('input');
      await auth.login(email.value, password.value);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const [name, email, password] = e.target.querySelectorAll('input');
      await auth.register(name.value, email.value, password.value);
    });
  }

  // Add to cart button example (add to product pages)
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const product = {
        id: e.target.dataset.productId,
        name: e.target.dataset.productName,
        price: parseFloat(e.target.dataset.productPrice),
        image: e.target.dataset.productImage
      };
      cart.addToCart(product);
    });
  });
});

// Example usage in shop.html or sproduct.html:
// <button class="add-to-cart" 
//   data-product-id="1" 
//   data-product-name="Product Name"
//   data-product-price="19.99"
//   data-product-image="img/products/f1.jpg">
//   Add to Cart
// </button>
