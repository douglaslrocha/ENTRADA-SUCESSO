const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    // List all deployments
    const res = await fetch(`${baseUrl}/deployments/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    const list = data.data || data;
    const arr = Array.isArray(list) ? list : [list];
    console.log('Total deployments found:', arr.length);
    
    // Print status of each
    for (const d of arr.slice(0, 3)) {
      console.log(`\nDeployment UUID: ${d.uuid}`);
      console.log(`  Status: ${d.status}`);
      console.log(`  Commit: ${d.commit_message}`);
    }

    // Fetch logs of first (latest) deployment
    const latestUUID = arr[0]?.uuid;
    if (latestUUID) {
      console.log('\n\n=== FETCHING LOGS FOR:', latestUUID, '===');
      const logRes = await fetch(`${baseUrl}/deployments/${latestUUID}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      console.log('Log endpoint status:', logRes.status);
      const logText = await logRes.text();
      // Print last 3000 chars
      console.log(logText.slice(-3000));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
