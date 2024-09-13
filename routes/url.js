const express = require('express');
const { handleUrl, getCountOfUrls } = require('../controllers/url');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/',authMiddleware, handleUrl);
// router.get('/analytics/:shortId', authMiddleware, handleGetAnalytics);
router.get('/count', authMiddleware, getCountOfUrls);

module.exports = router;
