const express = require("express");
const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis").default;

const app = express();
const port = 8080;

// Initialize Redis client
const redisClient = redis.createClient({
  host: "localhost", // Redis server hostname
  port: 6379, // Redis server port
});

redisClient.connect().catch(console.error);
// Express session setup
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "your-secret-key", // Replace with a strong, random secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000, // 1 minutes (in milliseconds)
    },
    ttl: 60, // Set to true in a production environment with HTTPS
  })
);

// Middleware to track user activity
app.use((req, res, next) => {
  console.log("middleware checked", req.session);
  if (req.session.user) {
    req.session.nowInrMinutes = Math.floor(Date.now() / 60e3);
  }
  next();
});

// Example route to test session
app.get("/homepage", (req, res) => {
  if (req.session.user) {
    res.send(`Welcome back, ${req.session.user}!`);
  } else {
    res.send("Welcome, You were logged out, please log in!");
  }
});

//login
app.get("/login/:username", (req, res) => {
  req.session.user = req.params.username;
  req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
  res.send({
    data: `Logged in as ${req.params.username}`,
  });
});

//logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.send("Logged out");
  });
});

app.get("/checkSession", (req, res) => {
  if (req.session.user) {
    res.send({
      status: "User session is present",
      session: req.session,
    });
  } else {
    res.send({
      status: "Opps! User session expired",
      session: req.session,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
