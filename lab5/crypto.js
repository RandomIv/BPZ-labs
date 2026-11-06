const crypto = require('crypto');

const key = process.env.PAYLOAD_KEY ? Buffer.from(process.env.PAYLOAD_KEY, 'base64') : null;

function encrypt(text) {
    if (!key) return text;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return [iv, encrypted, cipher.getAuthTag()].map((part) => part.toString('base64url')).join('.');
}

function decrypt(text) {
    if (!key) return text;
    const [iv, encrypted, tag] = text.split('.').map((part) => Buffer.from(part, 'base64url'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
