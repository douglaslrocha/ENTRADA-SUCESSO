const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const DEPLOY_UUID = 'k1efljrtii2dbya03kp4rofh';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    console.log('Stopping deployment...');
    // Let's try /deployments/{uuid}/stop
    const res1 = await fetch(`${baseUrl}/deployments/${DEPLOY_UUID}/stop`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stop endpoint status:', res1.status);
    const data1 = await res1.text();
    console.log('Stop response:', data1);

    // Let's try GET /deployments/{uuid}/stop just in case
    const res2 = await fetch(`${baseUrl}/deployments/${DEPLOY_UUID}/stop`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stop GET status:', res2.status);
    const data2 = await res2.text();
    console.log('Stop GET response:', data2);

    // Let's check application status and trigger force redeploy
    console.log('Triggering full deploy (start)...');
    const startRes = await fetch(`${baseUrl}/applications/${APP_UUID}/start?force=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Start Status:', startRes.status);
    const startData = await startRes.json();
    console.log('Start Response:', JSON.stringify(startData));
  } catch (err) {
    console.error(err);
  }
}
run();
