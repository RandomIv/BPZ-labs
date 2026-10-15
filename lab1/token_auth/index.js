const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

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

    init() {
        const sessionId = uuid.v4();
        this.set(sessionId);

        return sessionId;
    }

    regenerate(req) {
        if (req.sessionId) {
            delete this.#sessions[req.sessionId];
        }
        req.sessionId = this.init();
        req.session = {};
    }

    destroy(req) {
        delete this.#sessions[req.sessionId];
        this.#storeSessions();
        req.session = null;
        req.sessionId = null;
    }
}

const sessions = new Session();

app.use((req, res, next) => {
    const sessionId = req.get(SESSION_KEY);
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
    if (req.session.username) {
        return res.json({
            username: req.session.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    sessions.destroy(req);
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
        sessions.regenerate(req);
        req.session.username = user.username;
        req.session.login = user.login;

        return res.json({ token: req.sessionId });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
