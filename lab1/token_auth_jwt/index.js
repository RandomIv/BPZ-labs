const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const port = 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

function authenticate(req, res, next) {
    const header = req.get('Authorization');
    if (!header) {
        return next();
    }

    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).json({ error: 'invalid_token' });
    }

    try {
        const payload = jwt.verify(match[1], JWT_SECRET, { algorithms: ['HS256'] });
        console.log('JWT payload:', payload);
        req.user = payload;
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'token_expired' });
        }
        return res.status(401).json({ error: 'invalid_token' });
    }
}

app.get('/', authenticate, (req, res) => {
    if (req.user) {
        return res.json({
            username: req.user.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login === login && user.password === password) {
            return true;
        }
        return false
    });

    if (user) {
        const token = jwt.sign(
            { login: user.login, username: user.username },
            JWT_SECRET,
            { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
        );
        return res.json({ token });
    }

    return res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
