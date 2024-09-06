const express = require('express');
const { handleUrl } = require('../controllers/url');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',authMiddleware, handleUrl);
// router.get('/analytics/:shortId', authMiddleware, handleGetAnalytics);

module.exports = router;
