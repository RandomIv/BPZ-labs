import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { encrypt, decrypt } from './crypto.js';

export async function chat(connection, key) {
    const input = readline.createInterface({ input: process.stdin });
    input.on('line', (line) => {
        if (line.startsWith('/file ')) {
            const file = line.slice(6);
            connection.send(encrypt(key, { file: path.basename(file), content: fs.readFileSync(file, 'utf8') }));
            console.log('File sent:', file);
        } else {
            connection.send(encrypt(key, { text: line }));
        }
    });

    let message;
    while ((message = await connection.receive())) {
        console.log('Encrypted:', message.data);
        const { text, file, content } = decrypt(key, message);
        if (file) {
            fs.mkdirSync('received', { recursive: true });
            fs.writeFileSync(path.join('received', file), content);
            console.log('File received: received/' + file);
        } else {
            console.log('Peer:', text);
        }
    }

    console.log('Connection closed');
    input.close();
}
