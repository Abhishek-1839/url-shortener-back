const express = require('express');
const cors = require('cors');
const { mongoConnect } = require("./connet");
const urlRoute = require("./routes/url");
const authRoute = require("./routes/auth");
const authMiddleware = require('./middleware/authMiddleware');
const URL = require('./MODELS/url');
const cookieParser = require('cookie-parser');
// const { sendEmail } = require('./emailConfig');

require('dotenv').config();

const app = express();
app.use(express.json());

// Use cookie parser middleware
app.use(cookieParser());

// CORS configuration options
const corsOptions = {
    // Option 1: Allow all origins (least secure, most permissive)
    origin: 'https://jovial-selkie-15176d.netlify.app',
    
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
app.get('/auth/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
}); 

app.use("/url", authMiddleware, urlRoute);

app.get('/urllist', authMiddleware, async (req, res) => {
    try {
      console.log('Fetching URLs for user:', req.user._id);
      const urls = await URL.find({ userId: req.user._id });
      console.log('Fetched URLs:', urls);
      res.json(urls);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      res.status(500).json({ error: 'Failed to fetch URLs.' });
    }
  });

// app.get('/:shortId', async (req, res) => {
//     const shortId = req.params.shortId;
//     try {
//         const entry = await URL.findOneAndUpdate(
//             { shortId },
//             {
//                 $push: {
//                     visithistory: {
//                         timestamp: Date.now(),
//                     },
//                 },
//             },
//             { new: true }
//         );

//         if (entry) {
//             res.redirect(entry.redirectURL);
//         } else {
//             res.status(404).json({ error: "Short URL not found" });
//         }
//     } catch (err) {
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

app.get('/redirect/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    try {
      const url = await URL.findOne({ shortId });
      console.log(url);
      if (!url) {
        return res.status(404).send('URL not found');
      }
      // Increment the visit history
      url.visithistory.push({ timestamp: Date.now() });
      await url.save();
      // Redirect to the original URL
      res.redirect(url.redirectURL);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  app.post('/auth/logout', authMiddleware, (req, res) => {
    // Since we've already cleared the JWT token in the authMiddleware,
    // we can simply return a success response here
    res.json({ message: "Logged out successfully" });
  });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
