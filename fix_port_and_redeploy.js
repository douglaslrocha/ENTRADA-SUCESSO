const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    // Fix: set ports_exposes to 80 (Nginx) - not 3000 or 5000
    const res = await fetch(`${baseUrl}/applications/${APP_UUID}`, {
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
    const data = await res.json();
    console.log('PATCH Status:', res.status);
    console.log(JSON.stringify(data, null, 2));

    // Redeploy
    const deployRes = await fetch(`${baseUrl}/applications/${APP_UUID}/start`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const deployData = await deployRes.json();
    console.log('\nRedeploy Status:', deployRes.status);
    console.log(JSON.stringify(deployData, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
