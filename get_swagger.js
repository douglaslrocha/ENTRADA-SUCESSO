const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000';

async function run() {
  const endpoints = [
    '/api/v1/openapi.json',
    '/api/v1/docs',
    '/api-docs',
    '/docs',
    '/api/v1/services/types' // check if we can get supported service types
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Endpoint: ${ep} - Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Length: ${text.length}`);
        if (ep.endsWith('.json') || ep.includes('types')) {
          console.log(text.slice(0, 1000));
        }
      }
    } catch (err) {
      console.error(`Error fetching ${ep}:`, err.message);
    }
  }
}
run();
