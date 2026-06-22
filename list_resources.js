const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const listEndpoints = ['applications', 'databases', 'services', 'sources'];
    for (const endpoint of listEndpoints) {
      const res = await fetch(`${baseUrl}/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log(`--- ${endpoint.toUpperCase()} ---`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
