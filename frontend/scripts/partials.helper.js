document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#partial-container');

    if (container) {
        console.log('Container fundet i DOM:', container); // Bekræfter, at containeren findes

        fetch('/header') // Fetch anmoder om header.html fra serveren
            .then((response) => {
                console.log('Fetch status:', response.status); // Logger HTTP-statuskode fra serveren
                if (!response.ok) {
                    throw new Error('Fetch fejlede med status: ' + response.status);
                }
                return response.text();
            })
            .then((html) => {
                console.log('HTML fetched:', html); // Logger det hentede HTML-indhold
                container.innerHTML = html; // Indsætter HTML i containeren
            })
            .catch((error) => {
                console.error('Fejl under fetch:', error); // Logger fejl, hvis fetch fejler
            });
    } else {
        console.error('##partial-container ikke fundet i DOM'); // Fejl hvis container ikke findes
    }
});