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

    senderElement.appendChild(botIcon); // Add the icon to senderElement
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageContent);
    typeWriter(message, messageContent);
    // senderElement.appendChild(botIcon);
  } else {
    messageElement.classList.add("user");
    messageContent.textContent = message;
    messageElement.appendChild(senderElement);
    messageElement.appendChild(messageContent);
  }

  // Saml beskedelementet
  // messageElement.appendChild(senderElement);
  // messageElement.appendChild(messageContent);

  // Håndter eventuelle ekstra muligheder (f.eks. knapper)
  if (options.showCheckoutButton) {
    const checkoutButton = document.createElement("button");
    checkoutButton.classList.add("checkout-button");
    checkoutButton.textContent = "Gå til Checkout";
    checkoutButton.addEventListener("click", () => {
      // Omdiriger til checkout-siden
      window.location.href = "/cart"; // Opdater stien til din checkout-side
    });
    messageElement.appendChild(checkoutButton);
  }

  // Tilføj beskeden til chatvinduet
  chatbotMessages.appendChild(messageElement);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Samtalehistorik
let conversationHistory = [];

let uniqueIdCounter = 0;

async function handleUserMessage(userMessage) {
  // Tilføj system-besked, hvis det er første besked
  if (conversationHistory.length === 0) {
    const systemMessage = {
      role: "system",
      content:
        "Du er en hjælpsom chatbot for Joe & The Juice. Når brugeren indikerer, at de er klar til at gennemføre deres køb (f.eks. siger 'Jeg er klar til at betale' eller 'Jeg vil gerne checke ud'), skal du kalde 'checkout' funktionen. Efter at have kaldt funktionen, skal du informere brugeren om, at de kan klikke på checkout-knappen for at fuldføre deres køb. Når du prestenere produkter er det vigtigt ikke at bruge ** i din besked, dertil behøver du ikke nævne alle ingredientserne. ",
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
      console.log(
        "Function Arguments:",
        assistantMessage.function_call.arguments
      );

      // Hvis funktionen er 'checkout', sæt flaget
      if (assistantMessage.function_call.name === "checkout") {
        showCheckoutButton = true;
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

        appendMessage("Chatbot", assistantMessage.content, {
          showCheckoutButton,
        });

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

// Add this new function
function typeWriter(text, element, speed = 50) {
  let i = 0;
  element.textContent = "";

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}
