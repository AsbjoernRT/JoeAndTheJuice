document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  console.log(`Current path: ${path}`); // Debug: Se stien i konsollen

  if (path === '/checkout') {
    // Kald kun checkout-relaterede funktioner
    checkoutProducts();
    updateCartBadge();
  };

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const mainContent = document.getElementById('main-content');
    const chatButton = document.getElementById('chat-button');
    const chatModal = document.getElementById('chat-modal');
    const closeChat = document.getElementById('close-chat');
    const navLinks = document.querySelectorAll('#sidebar ul li a[data-page]');
  
    // Load the home page by default
    // loadPage('home');

    // Delay opdatering af badge
  setTimeout(() => {
    updateCartBadge();
  }, 500); // Forsinkelse på 1 sekund


  
    // // Toggle sidebar
    // menuToggle.addEventListener('click', () => {
    //   sidebar.classList.toggle('active');
    //   content.classList.toggle('active');
    // });
  
    // // Load content based on navigation
    // navLinks.forEach(link => {
    //   link.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     const page = link.getAttribute('data-page');
    //     loadPage(page);
    //     sidebar.classList.remove('active');
    //     content.classList.remove('active');
    //   });
    // });
  
    function loadPage(page) {
      mainContent.classList.remove('loaded');
      fetch(`/pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
          mainContent.innerHTML = html;
          mainContent.classList.add('loaded');
        })
        .catch(err => {
          mainContent.innerHTML = '<p>Error loading page.</p>';
        });
    }
  
  //   // Chat modal functionality
  //   chatButton.addEventListener('click', () => {
  //     chatModal.style.display = 'block';
  //   });
  
  //   closeChat.addEventListener('click', () => {
  //     chatModal.style.display = 'none';
  //   });
  
  //   window.addEventListener('click', (e) => {
  //     if (e.target == chatModal) {
  //       chatModal.style.display = 'none';
  //     }
  //   });
  });


  function checkoutProducts() {
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    // Hent kurv fra localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Tjek om kurven er tom
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        subtotalElement.textContent = 'DKK 0.00';
        totalElement.textContent = 'DKK 0.00';
        return;
    }

    let subtotal = 0;

    // Grupper produkter baseret på id
    const groupedCart = cart.reduce((acc, item) => {
        const existingItem = acc.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            acc.push({ ...item, quantity: 1 });
        }
        return acc;
    }, []);

    // Loop gennem kurvens produkter og generer HTML
    groupedCart.forEach((item) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('order-item');
        itemElement.innerHTML = `
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <p class="item-ingredients">${item.ingredients}</p>
                <p class="item-quantity">Quantity: ${item.quantity}</p>
            </div>
            <div class="item-price">DKK ${(item.price * item.quantity).toFixed(2)}</div>
        `;

        orderItemsContainer.appendChild(itemElement);

        // Beregn subtotal
        subtotal += item.price * item.quantity;
    });

    // Opdater subtotal og total
    subtotalElement.textContent = `DKK ${subtotal.toFixed(2)}`;
    totalElement.textContent = `DKK ${subtotal.toFixed(2)}`; // Antag gratis fragt
};

// Funktion til at opdatere badge
function updateCartBadge() {

  // Find badge-elementet
  // const cartBadge = document.querySelector('#cart-badge');
  const cartBadge = document.getElementById('cart-badge');
  if (!cartBadge) {
    console.log('Element med id #cart-badge blev ikke fundet i DOM');
    return;
  }

  // Hent kurv-data fra localStorage
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  console.log(cartItems);
  

  // Beregn det samlede antal produkter
  const totalItems = cartItems.length;

  // Opdater badge-indhold og synlighed
  if (totalItems > 0) {
    cartBadge.textContent = totalItems; // Sæt antallet af produkter
    cartBadge.style.display = 'block'; // Vis badge
  } else {
    cartBadge.style.display = 'none'; // Skjul badge, hvis kurven er tom
  }
}