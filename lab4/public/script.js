const REFRESH_BEFORE_SEC = 30;

const mainHolder = document.getElementById("main-holder");
const loginHeader = document.getElementById("login-header");
const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const signupButton = document.getElementById("signup-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
const logoutLink = document.getElementById("logout");
const tokenStatus = document.getElementById("token-status");

let refreshing = false;

function getSession() {
    return JSON.parse(sessionStorage.getItem('session'));
}

function saveSession(session) {
    sessionStorage.setItem('session', JSON.stringify(session));
}

async function checkToken() {
    const session = getSession();
    const secondsLeft = Math.round(session.expires_at - Date.now() / 1000);
    tokenStatus.textContent = `Access token expires in ${secondsLeft} s`;

    if (secondsLeft > REFRESH_BEFORE_SEC || refreshing) return;

    refreshing = true;
    const response = await axios.post('/api/refresh', { refresh_token: session.refresh_token });
    saveSession(response.data);
    console.log('Token refreshed at', new Date().toLocaleTimeString());
    refreshing = false;
}

const session = getSession();
if (session) {
    axios.get('/', {
        headers: {
            Authorization: `Bearer ${session.access_token}`
        }
    }).then(() => {
        loginForm.remove();
        loginErrorMsg.remove();
        loginHeader.remove();

        mainHolder.prepend(`Hello ${session.username}`);
        logoutLink.style.opacity = 1;
        setInterval(checkToken, 1000);
    }).catch(() => {
        sessionStorage.removeItem('session');
        location.reload();
    });
}

logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.removeItem('session');
    location.reload();
});

function submit(url) {
    const login = loginForm.login.value;
    const password = loginForm.password.value;

    axios.post(url, { login, password }).then((response) => {
        saveSession(response.data);
        location.reload();
    }).catch(() => {
        loginErrorMsg.style.opacity = 1;
    });
}

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    submit('/api/login');
});

signupButton.addEventListener("click", () => {
    submit('/api/signup');
});
    
