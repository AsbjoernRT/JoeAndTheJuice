# Velkommen Til Joeandthejuicechatbot.software 🌐

## Beskrivelse Af Projektet
Joeandthejuicechatbot.software Chatbot er en innovativ udvidelse af Joe & the Juice’s digitale satsning, der kombinerer e-handel og kunstig intelligens for at forbedre kundeoplevelsen. Ved at integrere OpenAI’s API giver projektet brugerne mulighed for at interagere med en intelligent chatbot, der kan håndtere ordrer effektivt. Chatbotten kan tilføje varer direkte til kundens kurv og føre dem videre til checkout-siden fra chatvinduet, hvilket skaber en sømløs og brugervenlig købsoplevelse.

---

## Funktioner
- Modalvindue for chatbotten, du kan intergere med
- Integration med 3. parts leverandør OpenAI, for at undgå udvikling af egen LLM.
- Fintuning til kun at kunne godtage JoeAndTheJuice relaterede forespørgsler og spørgsmål.
- Mulighed for placering af ordrer i kurv + fjerne ordrer fra din kurv

---

## Primære Node Moduler 📦
- **Axios**
- **Cors**
- **Redis**
- **Pm2**
- **Stripe**
- **Crypto**
- **Twilio**
- **Mssql**
- **Express**

---

## Kør Projektet Lokalt 🖥️
1. Clone repository ved hjælp af denne command: git clone https://github.com/AsbjoernRT/JoeAndTheJuice
2. Opret en kopi af filen `.env.example.joechatbot` og omdøb den til `.env`.
3. Udfyld de nødvendige miljøvariabler i din nye `.env`-fil, ellers kan application ikke køre korrekt.
4. Kør `node server.js` for at starte serveren

Nu kan du åbne en af vores mange porte der er skabt via Redis evt. enten http://localhost:3001 eller http://localhost:3002

---

## Besøg Live Projekt ✅

Du kan også nu efter du har kørt det lokalt besøge vores live projekt, som er hostet på vores Digital Ocean Droplet med domænet: https://joeandthejuicechatbot.software/

---

## Opgaven er lavet af

- **Mathias Hylleberg, 170839**
