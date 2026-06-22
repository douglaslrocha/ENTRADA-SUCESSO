const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const DEPLOY_UUID = 'jq67qq1r02se27knpr848xp0';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/${DEPLOY_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    console.log('Logs structure:');
    if (data.logs) {
      console.log(data.logs.slice(-2000));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
