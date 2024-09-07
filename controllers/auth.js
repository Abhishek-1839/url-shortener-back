const jwt = require('jsonwebtoken');
const User = require('../MODELS/user');
const crypto = require('crypto');
require('dotenv').config();
const { sendEmail } = require('../utils/email');


const generateActivationToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10m' });
};

const registerUser = async (req, res) => {
    console.log('Received registration request:', req.body);
    const { firstName, lastName, email, password } = req.body;
    try {
        const user = await User.create({ firstName, lastName, email, password });
        
        
        // Generate activation token
        const activationToken = generateActivationToken(user._id);
        user.activationToken = activationToken;
        await user.save();

        const activationLink = `http://localhost:8005/auth/activate/${activationToken}`;
        // await sendEmail(email, 'Activate your account', `Click this link to activate your account: ${activationLink}`);
        
        console.log('Sending registration email to:', req.body.email);
        await sendEmail(req.body.email, 'Registration Successful', 'Welcome to our service!');
        console.log('Registration email sent successfully');
        
        res.status(201).json({ message: "User registered. Please check your email to activate your account." });
    } catch (err) {
        console.log('Error in registration:', err);
        if (err.code === 'EAUTH') {
            res.status(500).json({ err: 'Email authentication failed. Please contact support.' });
          } else {
            res.status(500).json({ err: 'An error occurred during registration', details: err.message });
    }}
};

const activateUser = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOneAndUpdate(
            { _id: decoded.id, activationToken: token },
            { isActive: true, activationToken: null },
            { new: true }
        );

        if (!user) return res.status(400).json({ error: "Invalid or expired token" });
       
       
        res.json({ message: "Account activated. You can now log in." });
   
    } catch (err) { 
        
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        if (!user.isActive) return res.status(400).json({ error: "Please activate your account" });

        // Generate JWT token (for session management)
        // This is where you would issue the JWT token

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // For simplicity, returning user info
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `http://localhost:8005/auth/reset-password/${resetToken}`;
        await sendEmail(email, 'Reset your password', `Click this link to reset your password: ${resetLink}`);

        res.json({ message: "Password reset link sent to your email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User.findOne({ resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
         });
        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: "Password has been reset. You can now log in with your new password." });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    registerUser,
    activateUser,
    loginUser,
    forgotPassword,
    resetPassword
};
