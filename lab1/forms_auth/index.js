const uuid = require('uuid');
const express = require('express');
const cookieParser = require('cookie-parser');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_KEY = 'session';
const COOKIE_ATTRIBUTES = 'Path=/; HttpOnly';

class Session {
    #sessions = {}

    constructor() {
        try {
            this.#sessions = fs.readFileSync('./sessions.json', 'utf8');
            this.#sessions = JSON.parse(this.#sessions.trim());

            console.log(this.#sessions);
        } catch(e) {
            this.#sessions = {};
        }
    }

    #storeSessions() {
        fs.writeFileSync('./sessions.json', JSON.stringify(this.#sessions), 'utf-8');
    }

    set(key, value) {
        if (!value) {
            value = {};
        }
        this.#sessions[key] = value;
        this.#storeSessions();
    }

    get(key) {
        return this.#sessions[key];
    }

    init(res) {
        const sessionId = uuid.v4();
        res.set('Set-Cookie', `${SESSION_KEY}=${sessionId}; ${COOKIE_ATTRIBUTES}`);
        this.set(sessionId);

        return sessionId;
    }

    regenerate(req, res) {
        if (req.sessionId) {
            delete this.#sessions[req.sessionId];
        }
        req.sessionId = this.init(res);
        req.session = {};
    }

    destroy(req, res) {
        delete this.#sessions[req.sessionId];
        this.#storeSessions();
        req.session = null;
        req.sessionId = null;
        res.set('Set-Cookie', `${SESSION_KEY}=; ${COOKIE_ATTRIBUTES}; Max-Age=0`);
    }
}

const sessions = new Session();

app.use((req, res, next) => {
    const sessionId = req.cookies[SESSION_KEY];
    const currentSession = sessionId ? sessions.get(sessionId) : undefined;

    req.session = currentSession || {};
    req.sessionId = currentSession ? sessionId : null;

    onFinished(req, () => {
        if (req.sessionId && req.session) {
            sessions.set(req.sessionId, req.session);
        }
    });

    next();
});

app.get('/', (req, res) => {
    console.log(req.session);

    if (req.session.username) {
        return res.json({
            username: req.session.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    sessions.destroy(req, res);
    res.redirect('/');
});

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

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false
    });

    if (user) {
        sessions.regenerate(req, res);
        req.session.username = user.username;
        req.session.login = user.login;

        return res.json({ username: login });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
