document.addEventListener("DOMContentLoaded", () => {
  // Delay opdatering af badge
  setTimeout(() => {
    updateCartBadge();
  }, 50); // Forsinkelse på 1 sekund
});

let showCheckoutButton = false;

// Elementer
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotModal = document.getElementById("chatbot-modal");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById('chatbot-input');
const typingIndicator = document.getElementById('typing-indicator');
const messagesContainer = document.getElementById('chatbot-messages');

// Åbn chatbot modal
chatbotToggle.addEventListener("click", () => {
  chatbotModal.style.display = "block";
});

// Luk chatbot modal
chatbotClose.addEventListener("click", () => {
  chatbotModal.style.display = "none";
});

// Send besked ved Enter tast
chatbotInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && chatbotInput.value.trim() !== '') {
    const userMessage = chatbotInput.value.trim();

    // Append user's message
    appendMessage('user', userMessage);

    // Clear input and show loading
    chatbotInput.value = '';
    typingIndicator.style.display = 'block';
    chatbotInput.disabled = true;

    // Fetch chatbot response
    fetch('/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    })
    .then(response => response.json())
    .then(data => {
      typingIndicator.style.display = 'none';
      chatbotInput.disabled = false;
      // Display response with typewriting effect
      typeWriterEffect(data.response);
    })
    .catch(error => {
      console.error('Error:', error);
      typingIndicator.style.display = 'none';
      chatbotInput.disabled = false;
    });
  }
});

function appendMessage(sender, message, options = {}) {
  // Fjern typing-indikatoren, hvis den eksisterer
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.style.visibility = "hidden";
  }

  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  // Opret element til afsenderen
  const senderElement = document.createElement("div");
  senderElement.classList.add("sender");

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  // Hvis afsenderen er Chatbot, indsæt Joe-logoet
  if (sender === "Chatbot") {
    const botIcon = document.createElement("img");
    botIcon.src = "/assets/Joe billede.svg";
    botIcon.alt = "Chatbot";
    botIcon.classList.add("chatbot-icon");

    senderElement.appendChild(botIcon);

    // Tilføj typewriting-effekt for Chatbot-beskeder
    if (message) {
      let i = 0;
      function typeWriter() {
        if (i < message.length) {
          messageContent.textContent += message.charAt(i);
          i++;
          setTimeout(typeWriter, 50); // Justér skrivhastighed
        }
      }
      typeWriter();
    }
  } else {
    // Hvis afsenderen er brugeren, formatter beskeden som brugerbesked
    messageElement.classList.add("user");
    messageContent.textContent = message;
  }

  // Saml besked-elementet
  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageContent);

  // Håndtér eventuelle ekstra valgmuligheder, f.eks. knapper
  if (options.showCheckoutButton) {
    const checkoutButton = document.createElement("button");
    checkoutButton.classList.add("checkout-button");
    checkoutButton.textContent = "Gå til Checkout";
    checkoutButton.addEventListener("click", () => {
      // Redirect til checkout-side
      window.location.href = "/checkout";
    });
    messageElement.appendChild(checkoutButton);
  }

  // Append besked til chatbot-vinduet
  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Samtalehistorik
let conversationHistory = [];

let uniqueIdCounter = 0;


async function handleUserMessage(userMessage) {
  // const loadingElement = appendLoadingMessage(); // Tilføj spinner som besked
  showTypingIndicator();

  // Tilføj system-besked, hvis det er første besked
  if (conversationHistory.length === 0) {
    const systemMessage = {
      role: "system",
      content:
        "Du er en hjælpsom chatbot for Joe & The Juice. Når brugeren indikerer, at de er klar til at gennemføre deres køb (f.eks. siger 'Jeg er klar til at betale' eller 'Jeg vil gerne checke ud'), skal du kalde 'checkout' funktionen. Efter at have kaldt funktionen, skal du informere brugeren om, at de kan klikke på checkout-knappen for at fuldføre deres køb.",
    };
    conversationHistory.push(systemMessage);
  }

  // Tilføj brugerens besked til historikken
  if (userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    const data = await response.json();

    hideTypingIndicator(); // Skjul prikker
    // Fjern loading-elementet
    // chatbotMessages.removeChild(loadingElement);

    if (data.error) {
      throw new Error(data.error);
    }

    const assistantMessage = data.choices[0].message;

    // Håndter funktionskald fra assistenten
    if (assistantMessage.function_call) {
      // Tilføj assistentens funktionskald til historikken
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage.content || "",
        function_call: assistantMessage.function_call,
      });

      console.log("Function Name:", assistantMessage.function_call.name);
      console.log("Function Arguments:", assistantMessage.function_call.arguments);

      if (assistantMessage.content) {
        displayTypewriterEffect(assistantMessage.content);
        if (assistantMessage.content.toLowerCase().includes("checkout-knappen")) {
          showCheckoutButton = true;
        }
      }


      // Send en tom brugerbesked for at få assistentens svar efter funktionskaldet
      await handleUserMessage("");
    } else {
      // Tilføj assistentens svar til historikken
      // conversationHistory.push(assistantMessage);
      // Tilføj assistentens svar til historikken
    conversationHistory.push({
    role: "assistant",
    content: assistantMessage.content || "",
      });
      // Vis assistentens svar i chatvinduet
      if (assistantMessage.content) {
       
        // Tjek for nøgleord i assistentens svar
    const lowerCaseContent = assistantMessage.content.toLowerCase();
    if (
      lowerCaseContent.includes("checkout-knappen") ||
      lowerCaseContent.includes("gå til checkout") ||
      lowerCaseContent.includes("klar til at betale")
    ) {
      showCheckoutButton = true;
    }

    appendMessage("Chatbot", assistantMessage.content, { showCheckoutButton });

    // Nulstil flaget
    showCheckoutButton = false;
  }

  // Opdater kurven
  updateCartBadge();
}
  } catch (error) {
    console.error("Error:", error);
    appendMessage("Chatbot", "Der opstod en fejl. Prøv venligst igen senere.");
  }
}

// Implementer funktionerne

async function updateCartBadge() {
  try {
    const response = await fetch("/api/cart");
    const data = await response.json();
    console.log(data);
    
    if (data.success) {
      const cartBadge = document.getElementById("cart-badge");
      const totalItems = data.totalItems;

      if (totalItems > 0) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = "block";
      } else {
        cartBadge.style.display = "none";
      }
    } else {
      console.error("Fejl ved hentning af kurvstatus:", data.message);
    }
  } catch (error) {
    console.error("Fejl ved opdatering af kurvbadge:", error);
  }
}

function displayTypewriterEffect(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "bot-message");
  chatbotMessages.appendChild(messageElement);

  let i = 0;
  function typeWriter() {
    if (i < message.length) {
      messageElement.textContent += message.charAt(i);
      i++;
      setTimeout(typeWriter, 1); // Juster hastigheden
    }
  }
  typeWriter();
}

function appendLoadingMessage() {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "bot-message", "loading-message");

  const senderElement = document.createElement("div");
  senderElement.classList.add("sender");

  const loadingSpinner = document.createElement("div");
  loadingSpinner.classList.add("spinner");

  senderElement.appendChild(loadingSpinner); // Tilføj spinner til sender
  messageElement.appendChild(senderElement);

  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  return messageElement; // Returnér elementet, så det kan fjernes senere
}

function showLoadingSpinner() {
  const loadingElement = document.getElementById("chatbot-loading");
  loadingElement.style.display = "block";
}

function hideLoadingSpinner() {
  const loadingElement = document.getElementById("chatbot-loading");
  loadingElement.style.display = "none";
}

function showTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.style.visibility = "visible";
  }
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.style.visibility = "hidden";
  }
}

function typeWriterEffect(text) {
  let i = 0;
  const speed = 50;
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'chatbot');
  messagesContainer.appendChild(messageElement);

  function typeWriter() {
    if (i < text.length) {
      messageElement.textContent += text.charAt(i);
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  typeWriter();
}