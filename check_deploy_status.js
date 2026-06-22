const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const DEPLOY_UUID = 'ge6qwda3jwh30cuz2ryl4ge8';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/${DEPLOY_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    console.log(`Deployment ${DEPLOY_UUID} status: ${data.status}`);
    if (data.logs) {
      const lines = data.logs.split('\n');
      console.log('Last 20 log lines:');
      console.log(lines.slice(-20).join('\n'));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
