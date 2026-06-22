const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    console.log('Main Service Keys:', Object.keys(service));
    
    // Look at service.service_applications and service.service_databases
    console.log('service_applications count:', service.service_applications?.length);
    console.log('service_databases count:', service.service_databases?.length);
    
    if (service.service_databases && service.service_databases.length > 0) {
      console.log('First DB keys:', Object.keys(service.service_databases[0]));
      console.log('First DB data:', JSON.stringify(service.service_databases[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
