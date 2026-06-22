const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const apps = await res.json();
    console.log('--- APPLICATIONS DETAIL ---');
    for (const app of apps) {
      console.log(`Name: ${app.name}`);
      console.log(`UUID: ${app.uuid}`);
      console.log(`FQDN: ${app.fqdn}`);
      console.log(`Git Repository: ${app.git_repository}`);
      console.log(`Status: ${app.status}`);
      console.log('---------------------------');
    }
  } catch (err) {
    console.error(err);
  }
}
run();
