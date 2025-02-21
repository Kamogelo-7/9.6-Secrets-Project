import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;
env.config();

app.set("view engine", "ejs");
app.set("views", "./views"); // Ensure correct path

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//* Initilaze passport.js middleware
app.use(passport.initialize());

//*Enable session support to store uses info in a session
app.use(passport.session());

const db = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

db.connect((err) => {
  if (err) {
    console.error("⚠️ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully");
  }
});
const names = [
  "programming",
  "cooking",
  "Ai",
  "Fighting games",
  "Action moves",
  "Food",
  "Traveling",
  "learning",
  "EL Elyon",
];

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets", async (req, res) => {
  console.log(req.user);

  if (req.isAuthenticated()) {
    try {
      const result = await db.query(
        `SELECT secret FROM users WHERE email = $1`,
        [req.user.email]
      );
      console.log(result);

      const secret = result.rows[0]?.secret;

      // Fixing randoNames reference
      const randomziedIndex = Math.floor(Math.random() * names.length);
      const randoNames = names[randomziedIndex];
      if (secret) {
        res.render("secrets.ejs", { secrets: secret, namesResult: randoNames });
      } else {
        res.render("secrets.ejs", {
          secrets: "No secret yet!",
          namesResult: randoNames,
        }); // ✅ Fixed
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while fetching secrets.");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/submit", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("submit.ejs");
  } else {
    res.redirect("/login");
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  //* Used object destructuring to extract form data from the html
  const { username, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      username,
    ]);
    if (checkResult.rows.length) {
      //the user *already* exists
      res
        .status(409)
        .render("standError.ejs", { message: "User already exists" });
      return; // Exit early to prevent further execution
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [username, hash]
          );

          const user = result.rows[0];
          req.login(user, (err) => {
            if (err) {
              console.error("Error during login:", err);
              return res.redirect("/login"); // Handle any login errors
            }
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("An unexpected error occurred. Please try again.");
  }
});
//TODO: Add a get route for the submit button
//Think about how the logic should work with authentication.

//TODO: Create the post route for submit.
//Handle the submitted data and add it to the database

app.post("/submit", async (req, res) => {
  const submittedSecret = req.body.secret;
  try {
    await db.query("UPDATE users SET secret = $1 WHERE email = $2", [
      submittedSecret,
      req.user.email,
    ]);
    res.redirect("/secrets");
  } catch (err) {
    console.error(`An error occurred: ${err.stack}`);
    res.status(500).send("An unexpected error occurred. Please try again.");
  }
});

passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      // console.info(profile);
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES($1, $2)",
            [profile.email, "google-Oauth"]
          );
          return cb(null, newUser.rows[0]);
          // console.debug(newUser);
        } else {
          //User already exists

          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

//* Save users info to session
passport.serializeUser((user, cb) => {
  cb(null, user);
});

//* Retrieve users info from session
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
