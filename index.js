const express = require("express");
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName:"webhook",
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Connection Error:", err));
// messageSchema
  const messageSchema = new mongoose.Schema({
    from: String,
    to: String,
    message: String,
    timestamp: Date,
  });
  
  const Message = mongoose.model("Message", messageSchema);

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
app.post("/webhook", async (req, res) => {
    console.log("Received Webhook Data:", JSON.stringify(req.body, null, 2));
    try {
        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0];
    
        if (change?.value?.messages) {
          const messageData = change.value.messages[0];
          const newMessage = new Message({
            from: messageData.from,
            to: change.value.metadata.phone_number_id,
            message: messageData.text?.body || "No text",
            timestamp: new Date(),
          });
    
          await newMessage.save();
          console.log(" Message Saved to MongoDB:", newMessage);
        }
      } catch (error) {
        console.error(" Error Saving Message:", error);
      }
    
    res.sendStatus(200); // Acknowledge WhatsApp's request
});

app.listen(3000, () => console.log("Webhook running on port 3000"));
