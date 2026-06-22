const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    console.log('Build Pack:', data.build_pack);
    console.log('Dockerfile Location:', data.dockerfile_location);
    console.log('Ports Exposes:', data.ports_exposes);
  } catch (err) {
    console.error(err);
  }
}
run();
