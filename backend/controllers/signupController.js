import index from '../app.js'
import bcrypt from 'bcryptjs'

// Funktion til at håndtere en bruger at registrere sug
export const register = async (body, res) => {
    console.log("Req.body modtaget:", body);
    // Udpakker brugeroplysningerne fra request body'en
    const { fullName, email, age, weight, gender, password } = body;
    // Genererer en salt til brug for at hashe adgangskoden med bcrypt
    const salt = await bcrypt.genSalt(10);
     // Hasher adgangskoden med bcrypt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Logger den indtastede email og den hasede adgangskode til konsollen
    console.log("Login email: " + body.email, "Login password: " + hashedPassword);

    // Tjekker om den indtastede email allerede findes i databasen
    const DBemail = await index.connectedDatabase.getUserByMail(email);
    console.log(DBemail);
  
    // Hvis emailen ikke findes i databasen, oprettes brugeren
    if (DBemail == undefined) {
        // Beregner brugerens basalstofskifte ud fra alder, køn og vægt
        const cMetabolism = calculateMetabolism(age, gender, weight)
       // Opretter et brugerobjekt med de indtastede oplysninger og det beregnede basalstofskifte
        const user = {
            fullName,
            email,
            age,
            weight,
            gender,
            password: hashedPassword,
            metabolism: cMetabolism
        }
        // Gemmer brugeren i databasen
        index.connectedDatabase.createUser(user)
        // Omdirigerer brugeren til hjemmesiden med vellykket registrering
        res.redirect('/?registration=success');
    } else {
        console.log("User exists");
        // Redirect to the register route with a query parameter
        // res.redirect('/register?error=userexists');
        // res.redirect('register', {
        //     error: 'Bruger eksisterer allerede, gå til login',
        //     formData: {fullName, email, age, weight, gender } // Pass back the data
        // });
        
        // Hvis emailen allerede eksisterer i databasen, omdirigeres brugeren tilbage til registreringssiden med en fejlmeddelelse
        res.redirect(`/register?error=userexists&fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&age=${age}&weight=${weight}&gender=${encodeURIComponent(gender)}`);
    }


}