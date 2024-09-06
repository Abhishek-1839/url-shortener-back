const jwt = require('jsonwebtoken');
const User = require('../MODELS/user');

const authMiddleware = async (req, res, next) => {
    try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(400).json({ error: 'Authorization header missing' });
    }
    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token);
   
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        
        const user = await User.findById(decoded.id); 
            if (!user) {
                return res.status(401).json({ error: 'Please authenticate.' });
            }
            req.user = user;
            next();
        }
        catch (err) {
            console.error('JWT verification failed:', err);
        res.status(401).json({ error: 'JWT malformed or invalid token.' });
    }
};

module.exports = authMiddleware;
