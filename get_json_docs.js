const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000';

async function run() {
  const paths = [
    '/api-docs.json',
    '/api-docs/json',
    '/swagger.json',
    '/docs.json',
    '/openapi.json'
  ];
  for (const p of paths) {
    try {
      const res = await fetch(`${baseUrl}${p}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Path: ${p} - Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Length: ${text.length}`);
        if (text.startsWith('{')) {
          console.log('Valid JSON found at:', p);
          // print first 500 chars
          console.log(text.slice(0, 500));
          return;
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}
run();
