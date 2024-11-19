document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    const mainContent = document.getElementById('main-content');
    const chatButton = document.getElementById('chat-button');
    const chatModal = document.getElementById('chat-modal');
    const closeChat = document.getElementById('close-chat');
    const navLinks = document.querySelectorAll('#sidebar ul li a[data-page]');
  
    // Load the home page by default
    loadPage('home');
  
    // Toggle sidebar
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      content.classList.toggle('active');
    });
  
    // Load content based on navigation
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        loadPage(page);
        sidebar.classList.remove('active');
        content.classList.remove('active');
      });
    });
  
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
  
    // Chat modal functionality
    chatButton.addEventListener('click', () => {
      chatModal.style.display = 'block';
    });
  
    closeChat.addEventListener('click', () => {
      chatModal.style.display = 'none';
    });
  
    window.addEventListener('click', (e) => {
      if (e.target == chatModal) {
        chatModal.style.display = 'none';
      }
    });
  });