const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    // 1. Probe the app HTTP URL
    const appUrl = `http://hp87d540zadxizjfn5sgiffx.187.127.3.42.sslip.io`;
    console.log(`Probing application URL: ${appUrl}`);
    try {
      const probeRes = await fetch(appUrl);
      console.log(`HTTP Probe Status: ${probeRes.status}`);
    } catch (e) {
      console.log(`HTTP Probe failed: ${e.message}`);
    }

    // 2. Fetch runtime logs
    console.log('Fetching runtime logs...');
    const logRes = await fetch(`${baseUrl}/applications/${APP_UUID}/logs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const logData = await logRes.json();
    console.log('--- RUNTIME LOGS ---');
    console.log(logData.logs);
  } catch (err) {
    console.error(err);
  }
}
run();
