import net from 'node:net';
import { connect } from './connection.js';
import { serverHandshake } from './handshake.js';
import { chat } from './chat.js';

const server = net.createServer(async (socket) => {
    server.close();
    const connection = connect(socket);
    const key = await serverHandshake(connection);
    await chat(connection, key);
});

server.listen(4433, () => console.log('Server is listening on port 4433'));
