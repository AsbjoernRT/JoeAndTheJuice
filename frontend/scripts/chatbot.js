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
const orderButton = document.querySelector(".hero-button");

// Åbn chatbot modal
chatbotToggle.addEventListener("click", () => {
  chatbotModal.style.display = "block";
  showWelcomeMessage(); // Vis startbesked
});

// Åbn chatbot modal ved at klikke på order now knap
orderButton.addEventListener("click", () => {
  chatbotModal.style.display = "block";
  showWelcomeMessage(); // Vis startbesked
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
    botIcon.classList.add("chatbot-message-icon");

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
      content: `
      Du er JOE-sephine, den officielle chatbot for Joe & The Juice. 
      Din opgave er at hjælpe kunder med produktanbefalinger, bestillinger og almindelige spørgsmål. 

      **Produktpræsentation:**  
      - Præsenter produkter kort og præcist uden at bruge ** (fremhævning) eller lign. tegn.  
      - Ingredienser bør kun nævnes, hvis de er centrale for svaret.  

      **Tone of Voice:**  
    - Vær hjælpsom, positiv og professionel.  
    - Reflekter Joe & The Juice’s energiske og venlige atmosfære.  

    **Fejlhåndtering:**  
    - Brug venlige og positive fejlmeddelelser.  
    - Eksempel: “Oops! Noget gik galt. Prøv igen, så blander jeg det bedre næste gang!”  
`,
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
      credentials: "include", // ensures cookies are sent
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

function showWelcomeMessage() {
  // Undgå at vise beskeden flere gange
  if (conversationHistory.length === 0) {
    const welcomeMessage = "Hej! Jeg er JOE-sephine. Hvordan kan jeg hjælpe dig i dag?";
    appendMessage("Chatbot", welcomeMessage);
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
