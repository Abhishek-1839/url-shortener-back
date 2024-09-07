const express = require('express');
const cors = require('cors');
const { mongoConnect } = require("./connet");
const urlRoute = require("./routes/url");
const authRoute = require("./routes/auth");
const authMiddleware = require('./middleware/authMiddleware');
const URL = require('./MODELS/url');

require('dotenv').config();

const app = express();
app.use(express.json());
// CORS configuration options
const corsOptions = {
    // Option 1: Allow all origins (least secure, most permissive)
    origin: '*',
    
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
  
  app.use(cors(corsOptions));
const PORT = process.env.PORT || 8005;

mongoConnect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Connection error", err));

app.use("/auth", authRoute);
app.use("/url", authMiddleware, urlRoute);

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            {
                $push: {
                    visithistory: {
                        timestamp: Date.now(),
                    },
                },
            },
            { new: true }
        );

        if (entry) {
            res.redirect(entry.redirectURL);
        } else {
            res.status(404).json({ error: "Short URL not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
