document.addEventListener('DOMContentLoaded', () => {
    // Header container
    const headerContainer = document.querySelector('#partial-container');
  
    if (headerContainer) {
      console.log('Header-container fundet i DOM:', headerContainer);
  
      fetch('/header') // Fetch anmoder om header.html fra serveren
        .then((response) => {
          console.log('Header fetch status:', response.status);
          if (!response.ok) {
            throw new Error('Fetch fejlede for header med status: ' + response.status);
          }
          return response.text();
        })
        .then((html) => {
          console.log('Header HTML fetched:', html);
          headerContainer.innerHTML = html; // Indsætter header HTML i containeren
  
          // Initialize hamburger menu functionality
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
          console.log('Footer fetch status:', response.status);
          if (!response.ok) {
            throw new Error('Fetch fejlede for footer med status: ' + response.status);
          }
          return response.text();
        })
        .then((html) => {
          console.log('Footer HTML fetched:', html);
          footerContainer.innerHTML = html; // Indsætter footer HTML i containeren
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
        event.stopPropagation(); // Forhindr klik på hamburgeren i at lukke menuen
        menu.classList.toggle('active');
      });
  
      // Luk menuen, når der klikkes udenfor
      document.addEventListener('click', (event) => {
  
        if (menu.classList.contains('active') && !menu.contains(event.target)) {
          menu.classList.remove('active');
        }
      });
  
      console.log('Hamburger menu initialized.');
    } else {
      console.error('Hamburger or menu elements not found in DOM.');
    }
  }