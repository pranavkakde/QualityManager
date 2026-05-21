# Keycloak Authentication and Integration

## Overview
This document specifies the rules, architecture, and verification practices for the token-based Keycloak authentication system integrated into QualityManager services.

All microservices delegate authentication checking to the shared authentication middleware, which dynamically verifies signatures of standard RS256 JSON Web Tokens (JWT) issued by the Keycloak identity provider.

---

## Authentication Architecture

### 1. Token Verification Flow (Shared Middleware)
The authentication logic is implemented in the shared auth module: [shared/auth.js](file:///C:/Users/Pranav/Documents/Code/git/QualityManager/packages/Services/shared/auth.js).

When an API request arrives at a protected endpoint:
1. **Authorization Header**: The request must supply a bearer token: `Authorization: Bearer <JWT>`.
2. **Token Extraction & Decoding**: The middleware extracts and parses the JWT header *without verification* to retrieve the Key ID (`kid`) from the header.
3. **Public Key Fetching (JWKS)**:
   - The middleware checks an in-memory key cache for a PEM-formatted certificate associated with the `kid`.
   - If not cached, it queries Keycloak's JSON Web Key Set (JWKS) endpoint:
     `GET http://keycloak:8080/realms/master/protocol/openid-connect/certs`
   - It parses the keys, extracts the certificate array (`x5c`), constructs the PEM certificate, and stores it in the cache to optimize subsequent verifications.
4. **Signature Verification**:
   - The token is verified using `jsonwebtoken`'s `jwt.verify` method with the PEM certificate and the `RS256` algorithm.
5. **Claims Mapping**:
   - For backward compatibility with QualityManager database schemas and routes, the verified Keycloak claims are mapped onto the `req.user` object:
     - `req.user.username` is populated from the token's `preferred_username` claim.
     - `req.user.role` is set to `admin` if `preferred_username` is exactly `admin`; otherwise, it defaults to `user`.

### 2. Login Flow & Credentials Delegation
To maintain compatibility with existing client setups and avoid complex frontend redirects, login is handled via a **delegated credentials forwarding proxy** inside [UserManagementServices/routes/user.js](file:///C:/Users/Pranav/Documents/Code/git/QualityManager/packages/Services/UserManagementServices/routes/user.js):
- **Client Action**: The client sends a `POST` request containing a JSON body: `{ "username": "...", "password": "..." }` to `/api/user/login`.
- **Backend Service Action**: The backend service forwards these credentials to Keycloak's token endpoint:
  - **Method**: `POST`
  - **URL**: `http://keycloak:8080/realms/master/protocol/openid-connect/token`
  - **Content-Type**: `application/x-www-form-urlencoded`
  - **Form Fields**:
    - `client_id`: `admin-cli`
    - `grant_type`: `password`
    - `username`: `<username>`
    - `password`: `<password>`
- **Response Mapping**:
  - Keycloak processes the credentials and returns standard OAuth 2.0/OIDC token payloads.
  - The backend returns the Keycloak-issued `access_token` under the property `token` to the client.

---

## Environment Configuration

The following environment variables govern the authentication behavior:
- `AUTH_SERVICES_URL`: The URL pointing to the Keycloak instance.
  - **Production/Docker internal network**: `http://keycloak:8080` (inside microservices containers)
  - **Development/Host environment**: `http://localhost:9090` (from host machine)

---

## Developer Integration & Guidelines

### Protection of New Endpoints
Any new routes added to the microservices that require authorization must use the standard middleware:
```javascript
const { checkAuth } = require('../../shared/auth');

// Example protected route
router.get('/secure-data', checkAuth, (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});
```

### Mock/Developer Tokens (Bypasses)
> [!WARNING]
> **Mock tokens or custom dev signature keys are strictly prohibited.**
> All local environment testing must be validated against a live Keycloak instance or by obtaining a valid JWT directly from Keycloak via the login endpoint. Hardcoded or local HMAC bypasses violate security policies.

### Local Keycloak Setup and Verification
Keycloak is spun up locally via Docker Compose on port `9090` (`http://localhost:9090`).
To test authentication using standard command-line tools:

1. **Obtain Token via Keycloak Direct Grant**:
   ```bash
   curl -X POST http://localhost:9090/realms/master/protocol/openid-connect/token \
     -d "client_id=admin-cli" \
     -d "grant_type=password" \
     -d "username=admin" \
     -d "password=admin"
   ```
2. **Access a Secure API Endpoint**:
   ```bash
   curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:5173/api/user/users
   ```
