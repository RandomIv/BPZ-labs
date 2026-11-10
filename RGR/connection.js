import readline from 'node:readline';

export function connect(socket) {
    const lines = readline.createInterface({ input: socket })[Symbol.asyncIterator]();
    return {
        send(message) {
            socket.write(JSON.stringify(message) + '\n');
        },
        async receive() {
            const { value, done } = await lines.next();
            return done ? null : JSON.parse(value);
        },
    };
}
