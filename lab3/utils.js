export async function getToken() {
    const domain = process.env.MY_DOMAIN;

    const response = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.MY_M2M_CLIENT_ID,
            client_secret: process.env.MY_M2M_CLIENT_SECRET,
            audience: `https://${domain}/api/v2/`,
        }),
    });

    const result = await response.json();
    return result.access_token;
}
