const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    if (service.databases && service.databases.length > 0) {
      console.log('DB keys:', Object.keys(service.databases[0]));
      console.log('DB values:', JSON.stringify(service.databases[0], null, 2));
    } else {
      console.log('No databases array found in service object');
    }
  } catch (err) {
    console.error(err);
  }
}
run();
