# Velkommen Til Joeandthejuicechatbot.software 🌐

## Beskrivelse Af Projektet

Joeandthejuicechatbot.software er en innovativ udvidelse af Joe & The Juice’s digitale satsning, der kombinerer e-handel og kunstig intelligens for at forbedre kundeoplevelsen. Ved at integrere OpenAI’s API giver projektet brugerne mulighed for at interagere med en intelligent chatbot, der kan håndtere ordrer effektivt. Chatbotten kan tilføje varer direkte til kundens kurv og føre dem videre til checkout-siden fra chatvinduet, hvilket skaber en sømløs og brugervenlig købsoplevelse.

## Funktioner

	•	Modalvindue til chatbotten: Interager direkte fra hjemmesiden.
	•	Integration med OpenAI: Undgår udvikling af egen LLM.
	•	Fintuning af Chatbot: Begrænset til Joe & The Juice-relaterede forespørgsler og spørgsmål.
	•	Ordrehåndtering: Tilføj og fjern varer fra kurven direkte via chatbotten.

## Primære Node Moduler 📦

	•	Axios: HTTP-forespørgsler
	•	Cors: Håndtering af CORS-politikker
	•	Redis: Sessionshåndtering og caching
	•	Pm2: Processtyring og load balancing
	•	Stripe: Betalingshåndtering
	•	Crypto: Sikker datakryptering
	•	Twilio: SMS-verifikation
	•	Mssql: Databaseintegration
	•	Express: Serverramme

## Forudsætninger for at køre repositoriet lokalt

### Installer nødvendige pakker

	•	Homebrew: Pakkehåndtering til macOS
	•	Node.js: JavaScript-runtime

### Kør Projektet Lokalt 🖥️

    1. Opret og konfigurer .env-filen
	    •	Tilføj .env filen til projektet.
	    •	Vigtigt: Sørg for at placere .env-filen i hovedmappen af projektet.

	2.	Konfigurer Redis: 
        • Indsæt redis.conf, som er Redis-serverens konfigurationsfil.
        • Vigtigt: Sørg for at placere redis.conf i hovedmappen af projektet.

	3.	Installer Redis via Homebrew:

            brew install redis  
            brew services start redis  

	4.	Bekræft Redis fungerer: Kør redis-cli ping og forvent output: PONG.
    
	5.	Start serveren: Kør node server.js for at starte serveren.

	Bemærk: Uden lokal NginX-konfiguration kan applikationen ikke tilgås fra port 3000, men direkte via f.eks. http://localhost:3001 eller http://localhost:3002.

## Stripe Betalingsdetaljer 💳

Ved checkout skal der bruges et Stripe demo-kort for at simulere en betaling.

Kortoplysninger:
	•	Kortnummer: 4242 4242 4242 4242
	•	Udløbsdato: En gyldig fremtidig dato (f.eks. 12/34)
	•	CVV: 123
	•	

## Besøg Live Projekt ✅

Besøg vores live projekt hostet på vores Digital Ocean Droplet:
🔗 https://Joeandthejuicechatbot.software

## Opgaven er lavet af ⌨️

	•	Mathias Hylleberg - 170839
	•	Asbjørn Thomsen - 171390
	•	Martin Myrthue Pilkær - 168887
	•	Clara Lykke Bastiansen - 168877