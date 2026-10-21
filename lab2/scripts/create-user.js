import { getToken } from '../utils.js';

const domain = process.env.MY_DOMAIN;
const token = await getToken();

const user = {
    connection: 'Username-Password-Authentication',
    email: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
    email_verified: false,
};
console.log(`POST https://${domain}/api/v2/users`);
console.log({ ...user, password: '***' });

const response = await fetch(`https://${domain}/api/v2/users`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
});

const result = await response.json();
console.log('\nResponse:', response.status);
console.log(result);
