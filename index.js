const express = require("express");
const app = express();
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());

// Webhook Verification (GET)
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        console.log("Webhook Verified!");
        res.status(200).send(challenge);
    } else {
        res.status(403).send("Forbidden");
    }
});

// Handle Incoming Messages (POST)
app.post("/webhook", (req, res) => {
    console.log("Received Webhook Data:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200); // Acknowledge WhatsApp's request
});

app.listen(3000, () => console.log("Webhook running on port 3000"));
