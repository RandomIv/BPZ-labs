const domain = process.env.COURSE_DOMAIN;

const params = {
    grant_type: 'client_credentials',
    client_id: process.env.COURSE_CLIENT_ID,
    client_secret: process.env.COURSE_CLIENT_SECRET,
    audience: process.env.COURSE_AUDIENCE,
};
console.log(`POST https://${domain}/oauth/token`);
console.log({ ...params, client_secret: '***' });

const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
});

const result = await response.json();
console.log('\nResponse:', response.status);
console.log(result);
