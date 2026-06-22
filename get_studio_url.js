const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    console.log('--- SUB-SERVICE ENDPOINTS ---');
    if (service.applications) {
      for (const app of service.applications) {
        console.log(`- Container: ${app.name}`);
        console.log(`  FQDN: ${app.fqdn}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
