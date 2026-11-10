import crypto from 'node:crypto';

export const random = () => crypto.randomBytes(32).toString('hex');

export function generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
}

export function rsaEncrypt(publicKey, text) {
    return crypto.publicEncrypt(publicKey, Buffer.from(text)).toString('base64');
}

export function rsaDecrypt(privateKey, data) {
    return crypto.privateDecrypt(privateKey, Buffer.from(data, 'base64')).toString();
}

export function sessionKey(clientRandom, serverRandom, premaster) {
    return Buffer.from(crypto.hkdfSync('sha256', premaster, clientRandom + serverRandom, 'session key', 32));
}

export function encrypt(key, message) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(message)), cipher.final()]);
    return { iv: iv.toString('base64'), data: data.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}

export function decrypt(key, { iv, data, tag }) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString());
}
