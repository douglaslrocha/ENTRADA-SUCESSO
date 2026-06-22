const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/api-docs.json`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    console.log('Starts with:');
    console.log(text.slice(0, 300));
  } catch (err) {
    console.error(err);
  }
}
run();
