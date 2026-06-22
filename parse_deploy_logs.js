const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    
    // Get the latest failed deployment
    const latest = data.deployments[0];
    console.log('Deployment UUID:', latest.deployment_uuid);
    console.log('Status:', latest.status);
    
    const logs = JSON.parse(latest.logs);
    console.log('\n=== ALL LOG LINES (last 60) ===');
    const tail = logs.slice(-60);
    for (const line of tail) {
      const prefix = line.type === 'stderr' ? '❌ ERR' : '   OUT';
      console.log(`${prefix} | ${line.output}`);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
