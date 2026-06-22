const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    console.log('--- PORTS & CONTAINERS ---');
    if (service.applications) {
      for (const app of service.applications) {
        console.log(`App Name: ${app.name}`);
        console.log(`FQDN: ${app.fqdn}`);
        console.log(`Ports Expose: ${app.ports_exposes}`);
        console.log(`Ports Mapping: ${app.ports_mappings}`);
      }
    }
    if (service.databases) {
      for (const db of service.databases) {
        console.log(`DB Name: ${db.name}`);
        console.log(`Ports Expose: ${db.ports_exposes}`);
        console.log(`Ports Mapping: ${db.ports_mappings}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
