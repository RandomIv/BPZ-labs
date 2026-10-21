import { getToken } from '../utils.js';

const domain = process.env.MY_DOMAIN;
const email = process.env.USER_EMAIL;
const wantedNames = process.argv.slice(2);
const token = await getToken();
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const usersResponse = await fetch(`https://${domain}/api/v2/users-by-email?email=${encodeURIComponent(email)}`, { headers });
const users = await usersResponse.json();
const userRolesUrl = `https://${domain}/api/v2/users/${encodeURIComponent(users[0].user_id)}/roles`;

const rolesResponse = await fetch(`https://${domain}/api/v2/roles`, { headers });
const allRoles = await rolesResponse.json();
const wantedIds = allRoles.filter((role) => wantedNames.includes(role.name)).map((role) => role.id);

const currentResponse = await fetch(userRolesUrl, { headers });
const currentRoles = await currentResponse.json();
const currentIds = currentRoles.map((role) => role.id);

if (currentIds.length > 0) {
    await fetch(userRolesUrl, { method: 'DELETE', headers, body: JSON.stringify({ roles: currentIds }) });
}
await fetch(userRolesUrl, { method: 'POST', headers, body: JSON.stringify({ roles: wantedIds }) });

const resultResponse = await fetch(userRolesUrl, { headers });
const resultRoles = await resultResponse.json();
console.log(`${email} now has roles:`, resultRoles.map((role) => role.name));
