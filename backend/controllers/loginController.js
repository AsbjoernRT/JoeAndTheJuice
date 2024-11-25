const bcrypt = require('bcryptjs');

// Funktion til at præsentere login-siden
const renderLogin = async (req, res) => {
    console.log("Session details: ", req.session && req.session.loggedin);
    if (req.session.loggedin) {
        // Hvis brugeren er logget ind, omdirigeres de til hjemmesiden
        console.log("login Succes");
        res.redirect('../');
    } else {
        // Hvis brugeren ikke er logget ind, vises login-siden.
        console.log("not logged in")
        res.sendFile('login.html', { root: './views' })
    }
}

// Middleware til at sikre, at brugeren er godkendt
function authenticator(req, res, next) {
    if (!req.session || !req.session.loggedin) {
       // Omdiriger til login-siden, hvis ikke logget ind
        res.redirect('/login');
    } else {
      // Forsæt til næste middleware eller rutehåndterer, hvis logget ind
        next();
    }
}

// Funktion til at udføre login-processen
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Req.body received:", req.body);

    try {
        // Hent brugeroplysninger fra databasen baseret på e-mail
        const DBuser = await server.connectedDatabase.getUserByMail(email);
        console.log(DBuser);

        const result = validateLogin({ email, password }, DBuser);
        // Valider loginoplysningerne
        if (!result.valid) {
            // Hvis loginoplysningerne ikke er gyldige, omdirigeres brugeren til login-siden med fejlmeddelelse
            console.log(result.message);
            return res.redirect(`/login?error=${encodeURIComponent(result.message)}`);
        }

       // Gem brugerens session og omdiriger til hjemmesiden ved succesfuldt login
        console.log("User found - login success");
        req.session.loggedin = true;
        req.session.user = result.user;
        console.log("session saved:", req.session.loggedin, "session user data:", req.session.user);
        res.redirect('../?login=success');
    } catch (error) {
        // Hvis der opstår en fejl under login-processen, returneres en fejlmeddelelse
        console.error('Login error:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Funktion til at validere loginoplysninger
const validateLogin = (logInUser, DBuser) => {
    // Hvis der ikke findes en bruger med den angivne e-mail, returneres en fejlmeddelelse
    if (!DBuser || DBuser.email !== logInUser.email) {
        return { valid: false, message: 'No user with that email' };
    }
 // Hvis adgangskoden ikke matcher, returneres en fejlmeddelelse
    if (!bcrypt.compareSync(logInUser.password, DBuser.password)) {
        return { valid: false, message: 'Wrong password' };
    }

    return { valid: true, user: DBuser };
};

module.exports = {
    renderLogin,
    authenticator,
    login,
    validateLogin
};