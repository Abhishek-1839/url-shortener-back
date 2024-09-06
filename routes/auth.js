const express = require('express');
const {
    registerUser,
    activateUser,
    loginUser,
    forgotPassword,
    resetPassword
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', registerUser);
router.get('/activate/:token', activateUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
