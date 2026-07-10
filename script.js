/**
 * Cruncy & Topping - E-commerce Script
 * Pure JavaScript (ES6) - No Frameworks
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // INITIALIZATION & STATE
    // ==========================================================================
    let cart = JSON.parse(localStorage.getItem('cruncy_cart')) || [];
    const whatsappNumber = '6285864824730'; // Format internasional (tanpa + atau 0 di depan)

    // DOM Elements
    const loader = document.getElementById('loader');
    const header = document.getElementById('main-header');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const cartTrigger = document.getElementById('nav-link-cart');
    const heroCartTrigger = document.getElementById('btn-hero-order');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartBadge = document.getElementById('cart-badge');
    const cartFooter = document.getElementById('cart-footer');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const btnWhatsappCheckout = document.getElementById('btn-whatsapp-checkout');
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');

    // ==========================================================================
    // LOADING SCREEN
    // ==========================================================================
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 800); // Tampilan loading premium berdurasi singkat
    });

    // Fallback jika window load terlalu lama
    setTimeout(() => {
        if (loader && loader.style.display !== 'none') {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 3000);

    // ==========================================================================
    // STICKY NAVBAR & SCROLL HIGHLIGHT
    // ==========================================================================
    const handleScroll = () => {
        // Sticky Header effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll to Top Button visibility
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }

        // Active link on scroll (ScrollSpy)
        const scrollPosition = window.scrollY + 150;
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', handleScroll);

    // Click navigation links handler (smooth closing for mobile menu)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('cart-trigger')) {
                e.preventDefault();
                return;
            }
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Scroll to Top action
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ==========================================================================
    // HAMBURGER TOGGLE (MOBILE)
    // ==========================================================================
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // ==========================================================================
    // CART INTERFACE CONTROLS (OPEN/CLOSE DRAWER)
    // ==========================================================================
    const openCart = (e) => {
        if (e) e.preventDefault();
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        // Tutup menu mobile jika sedang terbuka saat membuka keranjang
        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('active');
    };

    const closeCart = () => {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    cartTrigger.addEventListener('click', openCart);
    heroCartTrigger.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // ==========================================================================
    // LOCALSTORAGE CART OPERATIONS
    // ==========================================================================
    
    // Save Cart to LocalStorage
    const saveCart = () => {
        localStorage.setItem('cruncy_cart', JSON.stringify(cart));
        updateCartUI();
    };

    // Format Rupiah Number
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number).replace('IDR', 'Rp');
    };

    // Update Cart UI, Badge and calculations
    const updateCartUI = () => {
        // Calculate total items (qty sum)
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.innerText = totalItems;
        
        // Pulse badge on change
        cartBadge.classList.add('pop');
        setTimeout(() => {
            cartBadge.classList.remove('pop');
        }, 300);

        // Render items inside drawer
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartItemsContainer.appendChild(cartEmptyMessage);
            cartFooter.style.display = 'none';
        } else {
            // Remove empty message if present
            if (document.getElementById('cart-empty-message')) {
                cartEmptyMessage.remove();
            }

            // Remove all current items before re-render
            const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
            existingItems.forEach(el => el.remove());

            let totalPrice = 0;

            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                totalPrice += subtotal;

                const itemHTML = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <span class="cart-item-name">${item.name}</span>
                            <span class="cart-item-price">${formatRupiah(item.price)}</span>
                            <div class="cart-item-controls">
                                <button class="qty-btn btn-minus" data-id="${item.id}">-</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="qty-btn btn-plus" data-id="${item.id}">+</button>
                            </div>
                            <span class="cart-item-subtotal">${formatRupiah(subtotal)}</span>
                        </div>
                        <button class="btn-remove-item" data-id="${item.id}" aria-label="Hapus produk">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
            });

            // Update footer total price display
            cartTotalAmount.innerText = formatRupiah(totalPrice);
            cartFooter.style.display = 'block';

            // Add Event Listeners to item control buttons
            setupCartItemListeners();
        }
    };

    // Setup events for inner-cart controls (+, -, and Trash)
    const setupCartItemListeners = () => {
        // Increment Item Qty
        cartItemsContainer.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const product = cart.find(item => item.id === id);
                if (product) {
                    product.quantity += 1;
                    saveCart();
                }
            });
        });

        // Decrement Item Qty
        cartItemsContainer.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const productIndex = cart.findIndex(item => item.id === id);
                if (productIndex > -1) {
                    if (cart[productIndex].quantity > 1) {
                        cart[productIndex].quantity -= 1;
                    } else {
                        // Jika 1 dikurangi, maka hapus dari keranjang
                        cart.splice(productIndex, 1);
                    }
                    saveCart();
                }
            });
        });

        // Delete Item
        cartItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);
                saveCart();
            });
        });
    };

    // Add To Cart Event from Product Cards
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');

            const existingProduct = cart.find(item => item.id === id);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ id, name, price, img, quantity: 1 });
            }

            saveCart();
            openCart(); // Auto open cart drawer
        });
    });

    // ==========================================================================
    // WHATSAPP CHECKOUT LOGIC
    // ==========================================================================
    btnWhatsappCheckout.addEventListener('click', (e) => {
        e.preventDefault();

        if (cart.length === 0) return;

        let message = `Halo Cruncy & Topping,\n\nSaya ingin memesan:\n`;
        message += `====================\n`;

        let totalOrderPrice = 0;
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalOrderPrice += subtotal;
            message += `• ${item.name} x${item.quantity}\n`;
        });

        message += `====================\n\n`;
        message += `Total: ${formatRupiah(totalOrderPrice)}\n\n`;
        message += `Terima kasih.`;

        const encodedMessage = encodeURIComponent(message);
        const waURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(waURL, '_blank');
    });

    // ==========================================================================
    // BUTTON RIPPLE EFFECT
    // ==========================================================================
    const rippleButtons = document.querySelectorAll('.btn-ripple, .qty-btn, .scroll-to-top');
    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // ==========================================================================
    // SCROLL REVEAL (INTERSECTION OBSERVER)
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Hentikan tracking jika sudah terungkap (opsional, untuk performance)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12, // Elemen terungkap ketika 12% masuk layar
        rootMargin: '0px 0px -50px 0px' // Offset sedikit di bagian bawah
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Render awal keranjang belanja dari LocalStorage
    updateCartUI();
});
