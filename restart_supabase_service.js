const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const SERVICE_UUID = 'x66wbwnbulrcp8shg16zcqra';

async function run() {
  try {
    console.log('Stopping service...');
    const stopRes = await fetch(`${baseUrl}/services/${SERVICE_UUID}/stop`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stop status:', stopRes.status);
    const stopData = await stopRes.text();
    console.log('Stop response:', stopData);

    console.log('Waiting 15 seconds for stop to complete...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log('Starting service...');
    const startRes = await fetch(`${baseUrl}/services/${SERVICE_UUID}/start`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Start status:', startRes.status);
    const startData = await startRes.json();
    console.log('Start response:', JSON.stringify(startData));
  } catch (err) {
    console.error(err);
  }
}
run();
