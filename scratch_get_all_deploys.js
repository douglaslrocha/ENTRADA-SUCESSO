const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    const list = data.deployments || [];
    console.log('List length:', list.length);
    for (const d of list.slice(0, 10)) {
      console.log(`- UUID: ${d.uuid || d.deployment_uuid}, Status: ${d.status}, Finished: ${d.finished_at || d.updated_at}, Link/URL: ${d.deployment_url}`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
