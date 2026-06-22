const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    
    // Get the most recent deployment
    const deployments = data.data || data;
    const latest = Array.isArray(deployments) ? deployments[0] : deployments;
    
    console.log('Latest Deployment:');
    console.log('  UUID:', latest.uuid);
    console.log('  Status:', latest.status);
    console.log('  Finished:', latest.finished_at);
    console.log('  Commit:', latest.commit_message);
    
    // Get deployment detail with logs
    if (latest.uuid) {
      const logRes = await fetch(`${baseUrl}/deployments/${latest.uuid}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const logData = await logRes.json();
      console.log('\n--- DEPLOYMENT DETAIL ---');
      console.log('Status:', logRes.status);
      if (logData.logs) {
        // Print last 100 lines of logs
        const logLines = logData.logs.split('\n');
        const tail = logLines.slice(-100).join('\n');
        console.log(tail);
      } else {
        console.log(JSON.stringify(logData, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
