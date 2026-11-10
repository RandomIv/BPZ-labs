import net from 'node:net';
import { connect } from './connection.js';
import { clientHandshake } from './handshake.js';
import { chat } from './chat.js';

const connection = connect(net.connect(4433, 'localhost'));
const key = await clientHandshake(connection);
await chat(connection, key);
