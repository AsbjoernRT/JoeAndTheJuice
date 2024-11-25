// const { log } = require("console");

// const { log } = require("console");

document.addEventListener('DOMContentLoaded', () => {
  // Delay opdatering af badge
  setTimeout(() => {
    updateCartBadge();
  }, 50); // Forsinkelse på 1 sekund
  

  // Lyt efter ændringer i localStorage
  window.addEventListener('storage', updateCartBadge);
});

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
// chatbot.js
console.log(products);

// Elementer
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotModal = document.getElementById("chatbot-modal");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");

// Åbn chatbot modal
chatbotToggle.addEventListener("click", () => {
  chatbotModal.style.display = "block";
});

// Luk chatbot modal
chatbotClose.addEventListener("click", () => {
  chatbotModal.style.display = "none";
});

// Send besked ved Enter tast
chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const userMessage = chatbotInput.value.trim();
    if (userMessage) {
      appendMessage("Bruger", userMessage);
      chatbotInput.value = "";
      handleUserMessage(userMessage);
    }
  }
});

function appendMessage(sender, message, options = {}) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  // Opret elementer til afsender og besked
  const senderElement = document.createElement("div");
  senderElement.classList.add("sender");

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");
  messageContent.textContent = message;

  // Hvis afsenderen er Chatbot, indsæt ikon
  if (sender === "Chatbot") {
    const botIcon = document.createElement("img");
    botIcon.src = "/assets/Joe billede.svg"; // Opdater stien til dit ikon
    botIcon.alt = "Chatbot";
    botIcon.classList.add("chatbot-icon");

    senderElement.appendChild(botIcon);
  } else {
    messageElement.classList.add("user");
  }

  // Saml beskedelementet
  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageContent);

  // Håndter eventuelle ekstra muligheder (f.eks. knapper)
  if (options.showCheckoutButton) {
    const checkoutButton = document.createElement("button");
    checkoutButton.classList.add("checkout-button");
    checkoutButton.textContent = "Gå til Checkout";
    checkoutButton.addEventListener("click", () => {
      proceedToCheckoutPage();
    });
    messageElement.appendChild(checkoutButton);
  }

  // Tilføj beskeden til chatvinduet
  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function proceedToCheckoutPage() {
  // For nu kan vi vise indholdet af kurven eller omdirigere til en side
  alert("Du bliver nu ført til checkout-siden.");
  // Omdiriger til checkout-siden
  // window.location.href = 'checkout.html';
}

// Samtalehistorik
let conversationHistory = [];

let uniqueIdCounter = 0;

// Implementer funktionerne
function addToCart(productId) {
  console.log("Received productId:", productId);
  console.log("Type of productId:", typeof productId);

  const product = products.find((p) => p.id.toString() === productId);

  if (product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Generer et unikt ID baseret på tælleren
    const uniqueProduct = {
      ...product,
      unique_id: ++uniqueIdCounter, // Tælleren tæller op
    };

    cart.push(uniqueProduct);

    // Opdater kurv og tæller i localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("uniqueIdCounter", uniqueIdCounter.toString());

    updateCartBadge();

    return {
      status: "success",
      message: `${product.name} er tilføjet til din kurv.`,
      unique_id: uniqueProduct.unique_id,
    };
  } else {
    return { status: "error", message: "Produktet blev ikke fundet." };
  }
}

function removeFromCart(uniqueIds) {
  try {
    if (!uniqueIds || uniqueIds.length === 0) {
      throw new Error("Ingen unikke IDs blev leveret.");
    }

    console.log("Received uniqueIds:", uniqueIds); // Debug-log
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Konverter IDs til strenge
    const uniqueIdsAsStrings = uniqueIds.map((id) => id.toString());

    console.log("Cart før fjernelse:", cart); // Debug-log
    console.log("uniqueIdsAsStrings:", uniqueIdsAsStrings); // Debug-log

    // Filtrér produkter, der IKKE skal fjernes
    const updatedCart = cart.filter(
      (product) => !uniqueIdsAsStrings.includes(product.unique_id.toString())
    );

    console.log("Updated cart:", updatedCart); // Debug-log

    // Bestem fjernede produkter
    const removedProducts = cart.filter((product) =>
      uniqueIdsAsStrings.includes(product.unique_id.toString())
    );

    console.log("Removed products:", removedProducts); // Debug-log

    // Opdater localStorage med den nye kurv
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Returnér succesbesked med fjernede produkter

    updateCartBadge();

    if (removedProducts.length > 0) {
      return {
        status: "success",
        message: `${removedProducts.length} produkt(er) blev fjernet fra kurven.`,
        removedProducts: removedProducts.map((product) => product.name),
        remainingCart: updatedCart,
      };
    } else {
      return {
        status: "error",
        message: "Ingen af produkterne blev fundet i kurven.",
        removedProducts: [],
        remainingCart: cart,
      };
    }
  } catch (error) {
    console.error("Fejl ved fjernelse fra kurven:", error);
    return {
      status: "error",
      message: "Der opstod en fejl under fjernelsen af produkter fra kurven.",
      error: error.message,
    };
  }
}

function checkCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    return {
      status: "empty",
      message: "Din kurv er tom.",
      cartItems: [],
    };
  }

  //Opret en oversigt over produkter i kurven
  let cartItems = cart.map((product) => {
    return {
      name: product.name,
      price: product.price,
      unique_id: product.unique_id,
    };
  });

  return {
    status: "success",
    message: "Du har ${cart.length} produkt(er) i din kurv.`",
    cartItems: cartItems,
  };
}

function proceedToCheckout() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    return {
      status: "error",
      message:
        "Din kurv er tom. Tilføj venligst varer til din kurv, før du går til checkout.",
    };
  }

  return {
    // window.location.href = 'checkout.html',
    status: "success",
    message: "Du er klar til at gå til checkout.",
    showCheckoutButton: true,
  };
}

function getProductInfo(productName) {
  const formattedProductName = productName.toLowerCase().replace(/\s+/g, "");
  const product = products.find((p) => {
    const formattedName = p.name.toLowerCase().replace(/\s+/g, "");
    console.log(formattedName);

    return formattedName.includes(formattedProductName);
  });

  if (product) {
    return {
      status: "success",
      data: `Produkt: ${product.name}, Ingredienser: ${product.ingredients}, Pris: ${product.price} kr, ID: ${product.id}`,
    };
  } else {
    return { status: "error", message: "Produktet blev ikke fundet." };
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
  // System-besked
  const systemMessage = {
    role: "system",
    content: "Du er en hjælpsom chatbot, der assisterer brugere med at shoppe online hos Joe & the juic og svare på evt. spørgsmål relateret dertil. Du må aldrig nævne interne detaljer som produkt-ID'er eller unikke nøgler. Fokuser på at give brugeren klare og venlige svar. Brug produkt data til at svare dem. Undgå at snakke om ikke joe & the juice relaterede emner.",
  };

  // Tilføj system-beskeden, hvis historikken er tom
  if (conversationHistory.length === 0) {
    conversationHistory.push(systemMessage);
  }


  // Tilføj brugerens besked til samtalehistorikken
  if (userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });
  }

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

      console.log("Function Name:", functionName);
      console.log("Function Arguments:", functionArgs);

      // Kald den relevante funktion
      if (functionName === "add_to_cart") {
        functionResponse = addToCart(functionArgs.product_id);
      } else if (functionName === "remove_from_cart") {
        const productId = functionArgs.product_id; // Hent enkelt produkt-ID
        console.log("Function Arguments:", functionArgs);

        // Pak enkelt produkt-ID ind i en array
        const productIds = [productId];
        console.log("Calling removeFromCart with productIds:", productIds);

        // Kald removeFromCart med korrekt argument
        functionResponse = removeFromCart(productIds);
      } else if (functionName === "check_cart") {
        functionResponse = checkCart();
      }else if (functionName === "proceed_to_checkout") {
        functionResponse = proceedToCheckout();
      } else if (functionName === "get_product_info") {
        functionResponse = getProductInfo(functionArgs.product_name);
      }

      // Tilføj assistentens funktionkald til historikken
      conversationHistory.push({
        role: "assistant",
        content: null,
        function_call: assistantMessage.function_call,
      });

      // Tilføj funktionens svar til historikken
      conversationHistory.push({
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResponse),
      });

      // Generer et nyt svar fra assistenten med funktionens resultat
      await handleUserMessage("");
      return; // Stop yderligere behandling i denne iteration
    } else {
      // Tilføj assistentens svar til samtalehistorikken
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage.content,
      });
    }

    // Håndter assistentens svar og functionResponse her
if (assistantMessage.content) {
  appendMessage("Chatbot", assistantMessage.content);
} else if (functionResponse) {
  // Hvis funktionen returnerer successtatus og indeholder varer i kurven
  if (functionResponse.status === "success" && functionResponse.cartItems) {
    const cartMessage = functionResponse.cartItems
      .map((item) => `${item.name} - ${item.price} kr`)
      .join("\n");

    appendMessage("Chatbot", `${functionResponse.message}\n${cartMessage}`);
  } else if (functionResponse.status === "empty") {
    // Hvis kurven er tom
    appendMessage("Chatbot", functionResponse.message);
  } else {
    // Generel fejlbesked
    appendMessage("Chatbot", functionResponse.message);
  }
}
  } catch (error) {
    console.error("Fejl:", error);
    appendMessage("Chatbot", "Der opstod en fejl. Prøv igen senere.");
  }
  // console.log('Function Response:', functionResponse);
}
// Test i chatbot.js eller i konsollen
// const testProduct = getProductInfo('Avocado Sandwich');
// console.log(testProduct);
