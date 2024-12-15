document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.querySelector('#partial-container');
  
    if (headerContainer) {
  
      fetch('/header') 
        .then((response) => {
          if (!response.ok) {
            throw new Error('Fetch fejlede for header med status: ' + response.status);
          }
          return response.text();
        })
        .then((html) => {
          headerContainer.innerHTML = html; 
  
          initializeHamburgerMenu();
        })
        .catch((error) => {
          console.error('Fejl under fetch af header:', error);
        });
    } else {
      console.error('#partial-container ikke fundet i DOM');
    }
  
    // Footer container
    const footerContainer = document.querySelector('#footer-container');
  
    if (footerContainer) {
  
      fetch('/footer')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Fetch fejlede for footer med status: ' + response.status);
          }
          return response.text();
        })
        .then((html) => {
          footerContainer.innerHTML = html;
        })
        .catch((error) => {
          console.error('Fejl under fetch af footer:', error);
        });
    } else {
      console.error('#footer-container ikke fundet i DOM');
    }
  });
  
  function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
  
    if (hamburger && menu) {
      // Toggle menu visibility
      hamburger.addEventListener('click', (event) => {
        event.stopPropagation(); 
        menu.classList.toggle('active');
      });
  
      // Luk menuen, når der klikkes udenfor
      document.addEventListener('click', (event) => {
  
        if (menu.classList.contains('active') && !menu.contains(event.target)) {
          menu.classList.remove('active');
        }
      });
  
    } else {
      console.error('Hamburger or menu elements not found in DOM.');
    }
  }

  // Create function to check login status and update nav
function updateLoginStatus() {
  const loginItem = document.querySelector('#loginItem');
  const session = req.session?.loggedIn; // Check session from cookie

  if (session) {
    loginItem.innerHTML = `
      <a href="#" onclick="handleLogout(event)" class="nav-link">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    `;
  } else {
    loginItem.innerHTML = `
      <a href="/login" class="nav-link">
        <i class="fas fa-sign-in-alt"></i> Login
      </a>
    `;
  }}
  
// Logout handler
async function logout() {
  
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });


    // Clear tokens
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    if (response.ok) {
      window.location.href = '/login';
    } else {
      console.error('Logout failed:', await response.json());
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
