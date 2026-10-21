import { getToken } from '../utils.js';

const domain = process.env.MY_DOMAIN;
const token = await getToken();

const roles = [
    { name: 'viewer', description: 'Read-only access' },
    { name: 'editor', description: 'Can edit content' },
    { name: 'admin', description: 'Full access' },
];

for (const role of roles) {
    const response = await fetch(`https://${domain}/api/v2/roles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
    });

    const result = await response.json();
    console.log(`${role.name}: ${response.status}`, result.id ?? result.message);
}
