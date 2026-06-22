const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    console.log('--- SERVICE DETAILS ---');
    console.log(`Name: ${service.name}`);
    console.log(`Status: ${service.status}`);
    console.log('Environment Variables (keys):');
    if (service.environment_variables) {
      service.environment_variables.forEach(ev => {
        console.log(`- ${ev.key} (UUID: ${ev.uuid}) = ${ev.value}`);
      });
    }
  } catch (err) {
    console.error(err);
  }
}
run();
