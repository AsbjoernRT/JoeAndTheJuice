// const { log } = require("console");

// const { log } = require("console");

// chatbot.js
console.log(products);

// Elementer
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotModal = document.getElementById('chatbot-modal');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');

// Åbn chatbot modal
chatbotToggle.addEventListener('click', () => {
  chatbotModal.style.display = 'block';
});

// Luk chatbot modal
chatbotClose.addEventListener('click', () => {
  chatbotModal.style.display = 'none';
});

// Send besked ved Enter tast
chatbotInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const userMessage = chatbotInput.value.trim();
    if (userMessage) {
      appendMessage('Bruger', userMessage);
      chatbotInput.value = '';
      handleUserMessage(userMessage);
    }
  }
});

// // Tilføj besked til chatten
// function appendMessage(sender, message) {
//   const messageElement = document.createElement('div');
//   messageElement.classList.add('message');
//   messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
//   chatbotMessages.appendChild(messageElement);
//   chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
// }

function appendMessage(sender, message, options = {}) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  // Hvis der er en knap, der skal vises
  if (options.showCheckoutButton) {
    messageElement.innerHTML = `
      <strong>${sender}:</strong> ${message}
      <br>
      <button class="checkout-button">Gå til Checkout</button>
    `;
  } else {
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  }

  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  // Hvis der er en knap, tilføj event listener
  if (options.showCheckoutButton) {
    const checkoutButton = messageElement.querySelector('.checkout-button');
    checkoutButton.addEventListener('click', () => {
      // Handling når knappen klikkes
      proceedToCheckoutPage();
    });
  }
}

function proceedToCheckoutPage() {
  // For nu kan vi vise indholdet af kurven eller omdirigere til en side
  alert('Du bliver nu ført til checkout-siden.');
  // Omdiriger til checkout-siden
  // window.location.href = 'checkout.html';
}

// Samtalehistorik
let conversationHistory = [];

// Implementer funktionerne
function addToCart(productId) {
  console.log('Received productId:', productId);
  console.log('Type of productId:', typeof productId);
  const product = products.find((p) => p.id.toString() === productId);

  if (product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    return { status: 'success', message: `${product.name} er tilføjet til din kurv.` };
  } else {
    return { status: 'error', message: 'Produktet blev ikke fundet.' };
  }
}

function proceedToCheckout() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    return { status: 'error', message: 'Din kurv er tom. Tilføj venligst varer til din kurv, før du går til checkout.' };
  }

  return {
    // window.location.href = 'checkout.html',
    status: 'success',
    message: 'Du er klar til at gå til checkout.',
    showCheckoutButton: true
    
  };
}

function getProductInfo(productName) {
  const formattedProductName = productName.toLowerCase().replace(/\s+/g, '');
  const product = products.find((p) => {
    const formattedName = p.name.toLowerCase().replace(/\s+/g, '');
    console.log(formattedName);
    
    return formattedName.includes(formattedProductName);
  });

  if (product) {
    return {
      status: 'success',
      data: `Produkt: ${product.name}, Ingredienser: ${product.ingredients}, Pris: ${product.price} kr.`,
    };
  } else {
    return { status: 'error', message: 'Produktet blev ikke fundet.' };
  } 
}

// Håndter brugerens besked og kommunikation med backend
// async function handleUserMessage(userMessage) {
//   // Tilføj brugerens besked til samtalehistorikken
//   if (userMessage) {
//     conversationHistory.push({ role: 'user', content: userMessage });
//   }

//   try {
//     const response = await fetch('http://localhost:3000/api/chat', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ messages: conversationHistory }),
//     });

//     const data = await response.json();

//     if (data.error) {
//       throw new Error(data.error);
//     }

//     const assistantMessage = data.choices[0].message;

//     // Håndter funktionkald
//     if (assistantMessage.function_call) {
//       const functionName = assistantMessage.function_call.name;
//       const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

//       let functionResponse;

//       // Kald den relevante funktion
//       if (functionName === 'add_to_cart') {
//         functionResponse = addToCart(functionArgs.product_id);
//       } else if (functionName === 'proceed_to_checkout') {
//         functionResponse = proceedToCheckout();
//       } else if (functionName === 'get_product_info') {
//         functionResponse = getProductInfo(functionArgs.product_name);
//       }

//       // Tilføj assistentens funktionkald til historikken
//       conversationHistory.push(assistantMessage);

//       // Tilføj funktionens svar til historikken
//       conversationHistory.push({
//         role: 'function',
//         name: functionName,
//         content: JSON.stringify(functionResponse),
//       });

//       // Generer et nyt svar fra assistenten med funktionens resultat
//       await handleUserMessage('');
//     } else {
//       // Tilføj assistentens svar til samtalehistorikken
//       conversationHistory.push({ role: 'assistant', content: assistantMessage.content });
//       appendMessage('Chatbot', assistantMessage.content);
//     }
//   } catch (error) {
//     console.error('Fejl:', error);
//     appendMessage('Chatbot', 'Der opstod en fejl. Prøv igen senere.');
//   }
// }

async function handleUserMessage(userMessage) {
  // Tilføj brugerens besked til samtalehistorikken
  if (userMessage) {
    conversationHistory.push({ role: 'user', content: userMessage });
  }

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    const assistantMessage = data.choices[0].message;

    // **Definer `functionResponse` her, så den er tilgængelig i hele funktionen**
    let functionResponse = null;

    // Håndter funktionkald
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

      console.log('Function Name:', functionName);
      console.log('Function Arguments:', functionArgs);

      // Kald den relevante funktion
      if (functionName === 'add_to_cart') {
        functionResponse = addToCart(functionArgs.product_id);
      } else if (functionName === 'proceed_to_checkout') {
        functionResponse = proceedToCheckout();
      } else if (functionName === 'get_product_info') {
        functionResponse = getProductInfo(functionArgs.product_name);
      }

      // Tilføj assistentens funktionkald til historikken
      conversationHistory.push({
        role: 'assistant',
        content: null,
        function_call: assistantMessage.function_call,
      });

      // Tilføj funktionens svar til historikken
      conversationHistory.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResponse),
      });

      // Generer et nyt svar fra assistenten med funktionens resultat
      await handleUserMessage('');
      return; // Stop yderligere behandling i denne iteration
    } else {
      // Tilføj assistentens svar til samtalehistorikken
      conversationHistory.push({ role: 'assistant', content: assistantMessage.content });
    }

    // **Håndter assistentens svar og functionResponse her**
    if (assistantMessage.content) {
      appendMessage('Chatbot', assistantMessage.content);
    } else if (functionResponse && functionResponse.status === 'success') {
      appendMessage('Chatbot', functionResponse.message, { showCheckoutButton: functionResponse.showCheckoutButton });
    } else if (functionResponse) {
      appendMessage('Chatbot', functionResponse.message);
    }
  } catch (error) {
    console.error('Fejl:', error);
    appendMessage('Chatbot', 'Der opstod en fejl. Prøv igen senere.');
  }
  // console.log('Function Response:', functionResponse);
}
// Test i chatbot.js eller i konsollen
// const testProduct = getProductInfo('Avocado Sandwich');
// console.log(testProduct);