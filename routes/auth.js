const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    registerUser,
    activateUser,
    loginUser,
    forgotPassword,
    resetPassword,
    getMe
} = require('../controllers/auth');

const router = express.Router();


router.get('/me', authMiddleware, getMe);
router.post('/register', registerUser);
router.get('/activate/:token', activateUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
