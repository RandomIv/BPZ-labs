const express = require('express');
const path = require('path');
const auth0 = require('./auth0');
const { decodePayload, toSession } = require('./session');
const port = 3000;

const app = express();
app.use(express.json());

app.get('/login', (req, res) => {
    res.redirect(auth0.authorizeUrl());
});

app.get('/', async (req, res) => {
    if (req.query.code) {
        const { ok, body } = await auth0.exchangeCode(req.query.code);
        if (!ok) {
            return res.status(401).json(body);
        }
        const sessionJson = JSON.stringify(JSON.stringify(toSession(body))).replace(/</g, '\\u003c');
        return res.send(`<script>sessionStorage.setItem('session', ${sessionJson}); location.replace('/');</script>`);
    }

    const token = req.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }

    const payload = decodePayload(token);
    if (payload.exp < Date.now() / 1000) {
        return res.status(401).json({ error: 'token_expired' });
    }
    res.json({ sub: payload.sub });
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/refresh', async (req, res) => {
    const { ok, body } = await auth0.refresh(req.body.refresh_token);
    if (!ok) {
        return res.status(401).json(body);
    }
    res.json({ ...toSession(body), refresh_token: body.refresh_token ?? req.body.refresh_token });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
