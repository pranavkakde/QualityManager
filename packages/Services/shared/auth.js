const jwt = require('jsonwebtoken');

// This is a simple middleware to verify JWT tokens.
// In a real scenario with Keycloak, you would use jwks-rsa to fetch the public key.
// For now, we will check if the token exists and is valid.

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // If you have a secret, verify it here:
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { ... })
    
    // Special case for development demo token
    if (token === 'demo-token-jwt') {
        req.user = { sub: 'demo-user', preferred_username: 'demo', role: 'admin' };
        return next();
    }
    
    try {
        const secret = process.env.JWT_SECRET || 'qualitymanager-secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token verification failed: ' + err.message });
    }
};

module.exports = { checkAuth };
