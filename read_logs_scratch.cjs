const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/applications/${APP_UUID}/logs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    const logs = typeof data === 'string' ? data : (data.logs || JSON.stringify(data));
    
    const lines = logs.split('\n');
    console.log('--- LAST 100 LOG LINES ---');
    console.log(lines.slice(-100).join('\n'));
  } catch (err) {
    console.error(err);
  }
}
run();
