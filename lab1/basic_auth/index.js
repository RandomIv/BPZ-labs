const express = require('express')
const app = express()
const port = 3000

function unauthorized(res) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Ukraine"');
    res.status(401);
    res.send('Unauthorized');
}

app.use((req, res, next) => {
    console.log('\n=======================================================\n');

    const authorizationHeader = req.get('Authorization');
    console.log('authorizationHeader', authorizationHeader);

    const match = /^Basic\s+(\S+)$/i.exec(authorizationHeader || '');
    if (!match) {
        return unauthorized(res);
    }

    const decodedAuthorizationHeader = Buffer.from(match[1], 'base64').toString('utf-8');
    console.log('decodedAuthorizationHeader', decodedAuthorizationHeader);

    const separatorIndex = decodedAuthorizationHeader.indexOf(':');
    if (separatorIndex === -1) {
        return unauthorized(res);
    }

    const login = decodedAuthorizationHeader.slice(0, separatorIndex);
    const password = decodedAuthorizationHeader.slice(separatorIndex + 1);
    console.log('Login/Password', login, password);

    if (login === 'DateArt' && password === '2408') {
        req.login = login;
        return next();
    }

    unauthorized(res);
});

app.get('/', (req, res) => {
    res.send(`Hello ${req.login}`);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
