const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const raw = await res.text();
    // Print first 2000 chars to understand structure
    console.log('Raw Response (first 2000 chars):');
    console.log(raw.slice(0, 2000));
  } catch (err) {
    console.error(err);
  }
}
run();
