let cart = [];
let cartCount = 0;

document.addEventListener('DOMContentLoaded', function () {
    loadCart();
    updateCartUI();
    setupCartButtons();
    setupMobileMenu();
    setupReviewSlider();
    setupCartIcon();
    setupDarkMode();
    setupAuthModal();    
    checkUserLogin();    
});

function setupCartButtons() {
    const addToCartButtons = document.querySelectorAll('.menu-btn');

    console.log('Found ' + addToCartButtons.length + ' cart buttons');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const card = this.parentElement;
            const itemName = card.querySelector('h2') ? card.querySelector('h2').textContent : 'Item';
            const itemPrice = card.querySelector('h4') ? card.querySelector('h4').textContent : 'PKR 0';
            const itemImage = card.querySelector('img') ? card.querySelector('img').src : '';

            console.log('Adding to cart:', itemName, itemPrice);
            addToCart(itemName, itemPrice, itemImage);

            this.textContent = 'Added!';
            this.style.backgroundColor = '#28a745';

            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.backgroundColor = '';
            }, 1000);
        });
    });
}

function setupCartIcon() {
    const cartIcon = document.querySelector('.fa-bag-shopping');
    if (cartIcon) {
        cartIcon.parentElement.addEventListener('click', function (e) {
            e.preventDefault();
            openCartModal();
        });
    }
}

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    cartCount++;
    saveCart();
    updateCartUI();
    showNotification(name + ' added to cart!');
}

function removeFromCart(index) {
    const item = cart[index];
    cartCount -= item.quantity;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showNotification(item.name + ' removed from cart!');
}

function updateQuantity(index, change) {
    if (!cart[index]) return;

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        cartCount += change;
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    const cartValueElement = document.querySelector('.cart-value');
    if (cartValueElement) {
        cartValueElement.textContent = cartCount;
        cartValueElement.classList.add('bounce');
        setTimeout(() => {
            cartValueElement.classList.remove('bounce');
        }, 300);
    }
}

function saveCart() {
    localStorage.setItem('foodieCart', JSON.stringify(cart));
    localStorage.setItem('foodieCartCount', cartCount);
}

function loadCart() {
    const savedCart = localStorage.getItem('foodieCart');
    const savedCount = localStorage.getItem('foodieCartCount');

    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }

    if (savedCount) {
        cartCount = parseInt(savedCount);
    }
}

function showNotification(message) {
    const existing = document.querySelector('.cart-notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 2000);
}

function openCartModal() {
    let modal = document.getElementById('cartModal');

    if (!modal) {
        createCartModal();
        modal = document.getElementById('cartModal');
    }

    updateCartModal();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function createCartModal() {
    const modalHTML = `
        <div id="cartModal" class="cart-modal">
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2><i class="fa-solid fa-bag-shopping"></i> Your Cart</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="cart-modal-body" id="cartItems">
                    <!-- Cart items will be inserted here -->
                </div>
                <div class="cart-modal-footer">
                    <div class="cart-total">
                        <h3>Total: <span id="cartTotal">PKR 0</span></h3>
                    </div>
                    <button class="checkout-btn">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal events
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartModal);
    }

    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeCartModal();
            }
        });
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            if (cart.length === 0) {
                alert('Your cart is empty!');
            } else {
                const total = calculateTotal();
                const itemCount = cart.length;

                alert('Order Placed Successfully! 🎉\n\nItems: ' + itemCount + '\nTotal: ' + total + '\n\nThank you for your order!');

                cart = [];
                cartCount = 0;
                saveCart();
                updateCartUI();
                closeCartModal();

                showNotification('Order placed successfully! Cart cleared.');
            }
        });
    }
}

function updateCartModal() {
    const cartItemsContainer = document.getElementById('cartItems');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>Your cart is empty</p>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${item.price}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        totalElement.textContent = calculateTotal();
    }
}

function calculateTotal() {
    let total = 0;

    cart.forEach(item => {
        const priceMatch = item.price.match(/\d+/);
        if (priceMatch) {
            const price = parseInt(priceMatch[0]);
            total += price * item.quantity;
        }
    });

    return 'PKR ' + total.toLocaleString();
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}


function setupMobileMenu() {
    const sidebarBtn = document.querySelector('.side-bar');
    const mobileManu = document.querySelector('.mobile-manu');

    if (!sidebarBtn || !mobileManu) return;

    if (!document.querySelector('.mobile-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function () {
            closeMobileMenu();
        });
    }

    const overlay = document.querySelector('.mobile-overlay');

    sidebarBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (mobileManu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileManu.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        if (e.clientX > rect.right - 55 && e.clientY < rect.top + 55) {
            closeMobileMenu();
        }
    });

    const mobileLinks = mobileManu.querySelectorAll('li a:not(.signin-btn-mobile)');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (!this.closest('.mobile-dark-mode')) {
                closeMobileMenu();
            }
        });
    });

    function openMobileMenu() {
        mobileManu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileManu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}


function setupDarkMode() {
    const mobileDarkModeToggle = document.getElementById('mobileDarkModeToggle');

    if (!mobileDarkModeToggle) return;

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        mobileDarkModeToggle.checked = true;
    }

    mobileDarkModeToggle.addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
            showNotification('Dark Mode Enabled 🌙');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
            showNotification('Light Mode Enabled ☀️');
        }
    });
}


function setupReviewSlider() {
    const reviews = document.querySelectorAll('.review-slide');
    const prevBtn = document.getElementById('prevReview');
    const nextBtn = document.getElementById('nextReview');
    let currentReview = 0;

    function showReview(index) {
        reviews.forEach(review => review.classList.remove('active'));
        if (reviews[index]) {
            reviews[index].classList.add('active');
        }
    }

    if (prevBtn && nextBtn && reviews.length > 0) {
        prevBtn.addEventListener('click', function () {
            currentReview = (currentReview - 1 + reviews.length) % reviews.length;
            showReview(currentReview);
        });

        nextBtn.addEventListener('click', function () {
            currentReview = (currentReview + 1) % reviews.length;
            showReview(currentReview);
        });
    }
}


function setupAuthModal() {
    const signInBtns = document.querySelectorAll('.signin-btn, .signin-btn-mobile');
    signInBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openAuthModal();
            showSignInForm();
        });
    });

    const closeBtn = document.querySelector('.close-auth');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
    }

    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeAuthModal();
            }
        });
    }
    const showSignUpBtn = document.getElementById('showSignUp');
    if (showSignUpBtn) {
        showSignUpBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showSignUpForm();
        });
    }

    const showSignInBtn = document.getElementById('showSignIn');
    if (showSignInBtn) {
        showSignInBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showSignInForm();
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSignIn(this);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSignUp(this);
        });
    }

    const googleBtns = document.querySelectorAll('.google-btn');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            alert('Google Sign In coming soon! 🚀');
        });
    });
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showSignInForm() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    if (signInForm && signUpForm) {
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    }
}

function showSignUpForm() {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    if (signInForm && signUpForm) {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
    }
}

function handleSignIn(form) {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    if (!email || !password) {
        alert('Please fill in all fields!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('foodieUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Welcome back, ' + user.name + '! 🎉');
        updateNavbarUser(user.name);
        closeAuthModal();
        form.reset();
    } else {
        alert('Invalid email or password!');
    }
}

function handleSignUp(form) {
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const phone = form.querySelector('input[type="tel"]').value;
    const passwords = form.querySelectorAll('input[type="password"]');
    const password = passwords[0].value;
    const confirmPassword = passwords[1].value;

    if (!name || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all fields!');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('foodieUsers')) || [];
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        alert('Email already registered!');
        return;
    }

    const newUser = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('foodieUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showNotification('Account created successfully! Welcome ' + name + '! 🎉');
    updateNavbarUser(name);
    closeAuthModal();
    form.reset();
}

function updateNavbarUser(userName) {
    const signInBtns = document.querySelectorAll('.signin-btn, .signin-btn-mobile');
    signInBtns.forEach(btn => {
        btn.innerHTML = '<i class="fa-solid fa-user"></i> ' + userName.split(' ')[0];
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'default';
    });
}

function checkUserLogin() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            updateNavbarUser(user.name);
        } catch (e) {
            console.error('Error loading user:', e);
        }
    }
}