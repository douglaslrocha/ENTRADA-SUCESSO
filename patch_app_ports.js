const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    console.log('Patching application ports_exposes to 80...');
    const patchRes = await fetch(`${baseUrl}/applications/${APP_UUID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ports_exposes: '80',
        build_pack: 'dockerfile',
        dockerfile_location: '/Dockerfile'
      })
    });
    console.log('PATCH Status:', patchRes.status);
    const data = await patchRes.json();
    console.log('PATCH Response:', JSON.stringify(data).slice(0, 1000));

    if (patchRes.ok) {
      console.log('Triggering redeploy with ports_exposes=80...');
      const startRes = await fetch(`${baseUrl}/applications/${APP_UUID}/start`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      console.log('Redeploy Status:', startRes.status);
      const startData = await startRes.json();
      console.log('Redeploy Response:', JSON.stringify(startData));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
