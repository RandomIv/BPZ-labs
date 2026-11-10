import { random, generateKeyPair, rsaEncrypt, rsaDecrypt, sessionKey, encrypt, decrypt } from './crypto.js';

export async function clientHandshake(connection) {
    const clientRandom = random();
    connection.send({ type: 'client_hello', random: clientRandom });
    console.log('1. Client hello sent, random:', clientRandom);

    const { random: serverRandom, publicKey } = await connection.receive();
    console.log('2. Server hello received, random:', serverRandom);
    console.log(publicKey);

    console.log('3. Certificate check skipped');

    const premaster = random();
    connection.send({ type: 'premaster', data: rsaEncrypt(publicKey, premaster) });
    console.log('4. Premaster sent, encrypted with the server public key:', premaster);

    const key = sessionKey(clientRandom, serverRandom, premaster);
    console.log('5. Session key:', key.toString('hex'));

    await exchangeReady(connection, key);
    return key;
}

export async function serverHandshake(connection) {
    const { random: clientRandom } = await connection.receive();
    console.log('1. Client hello received, random:', clientRandom);

    const { publicKey, privateKey } = generateKeyPair();
    const serverRandom = random();
    connection.send({ type: 'server_hello', random: serverRandom, publicKey });
    console.log('2. Server hello sent with the public key, random:', serverRandom);

    console.log('3. Certificate check skipped');

    const { data } = await connection.receive();
    const premaster = rsaDecrypt(privateKey, data);
    console.log('4. Premaster received and decrypted with the private key:', premaster);

    const key = sessionKey(clientRandom, serverRandom, premaster);
    console.log('5. Session key:', key.toString('hex'));

    await exchangeReady(connection, key);
    return key;
}

async function exchangeReady(connection, key) {
    connection.send(encrypt(key, 'ready'));
    console.log('6. Ready sent, encrypted with the session key');

    const ready = decrypt(key, await connection.receive());
    console.log('6. Ready received and decrypted:', ready);

    console.log('7. Handshake complete, type a message or /file <path>');
}
