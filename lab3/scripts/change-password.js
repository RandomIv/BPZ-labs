import { getToken } from '../utils.js';

const domain = process.env.MY_DOMAIN;
const email = process.env.USER_EMAIL;
const token = await getToken();
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const usersResponse = await fetch(`https://${domain}/api/v2/users-by-email?email=${encodeURIComponent(email)}`, { headers });
const users = await usersResponse.json();
const userUrl = `https://${domain}/api/v2/users/${encodeURIComponent(users[0].user_id)}`;

const body = {
    password: process.env.USER_NEW_PASSWORD,
    connection: 'Username-Password-Authentication',
};
console.log(`PATCH ${userUrl}`);
console.log({ ...body, password: '***' });

const response = await fetch(userUrl, { method: 'PATCH', headers, body: JSON.stringify(body) });

const result = await response.json();
console.log('\nResponse:', response.status);
console.log(result);
