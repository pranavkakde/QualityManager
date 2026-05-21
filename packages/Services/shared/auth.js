const jwt = require('jsonwebtoken');
const http = require('http');
const https = require('https');

// In-memory cache for Keycloak public keys to avoid fetching them on every request
const keyCache = {};

function getCerts(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Certs request failed with status: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse certs response: ${e.message}. Raw: ${data}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function fetchPublicKey(kid) {
    if (keyCache[kid]) {
        return keyCache[kid];
    }

    try {
        const authUrl = process.env.AUTH_SERVICES_URL || 'http://keycloak:8080';
        const certsUrl = `${authUrl}/realms/master/protocol/openid-connect/certs`;
        
        console.log(`[AUTH] Fetching Keycloak certificates from: ${certsUrl}`);
        const certs = await getCerts(certsUrl);
        const keys = certs.keys;
        
        if (!keys || !Array.isArray(keys)) {
            throw new Error('Invalid response structure from Keycloak certs endpoint');
        }

        for (const key of keys) {
            if (key.x5c && key.x5c.length > 0) {
                const pem = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
                keyCache[key.kid] = pem;
            }
        }

        if (keyCache[kid]) {
            return keyCache[kid];
        } else {
            throw new Error(`Key ID ${kid} not found in Keycloak certs`);
        }
    } catch (err) {
        console.error('[AUTH] Failed to fetch public key from Keycloak:', err.message);
        throw err;
    }
}

const checkAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Decode token to extract header kid
        const decodedToken = jwt.decode(token, { complete: true });
        if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        const kid = decodedToken.header.kid;
        const publicKey = await fetchPublicKey(kid);

        // Verify signature with RS256
        const verified = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        
        // Map Keycloak claims for backward compatibility with QualityManager microservices
        req.user = verified;
        req.user.username = verified.preferred_username;
        req.user.role = verified.preferred_username === 'admin' ? 'admin' : 'user';

        next();
    } catch (err) {
        console.error('[AUTH] Token verification failed:', err.message);
        return res.status(401).json({ error: 'Token verification failed: ' + err.message });
    }
};

module.exports = { checkAuth };
