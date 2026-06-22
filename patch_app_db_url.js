const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';
const DATABASE_URL = 'postgresql://postgres:ptUtQmv787k3fXI4uCW3rjOybzR9lJrM@187.127.3.42:5432/postgres?sslmode=disable';

async function run() {
  try {
    console.log('Patching DATABASE_URL...');
    const res = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        key: 'DATABASE_URL',
        value: DATABASE_URL
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data));

    if (res.ok) {
      console.log('Triggering redeploy...');
      const deployRes = await fetch(`${baseUrl}/applications/${APP_UUID}/start`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      console.log('Redeploy Status:', deployRes.status);
      const deployData = await deployRes.json();
      console.log('Deploy Response:', JSON.stringify(deployData));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
