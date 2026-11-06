function decodePayload(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
}

function toSession(tokens) {
    return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        username: decodePayload(tokens.id_token).email,
    };
}

module.exports = { decodePayload, toSession };
