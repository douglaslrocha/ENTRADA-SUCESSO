const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    // 1. Get current application details
    const res = await fetch(`${baseUrl}/applications/${APP_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const app = await res.json();
    
    if (!app.custom_labels) {
      console.log('No custom labels found.');
      return;
    }

    // 2. Decode custom_labels
    const decoded = Buffer.from(app.custom_labels, 'base64').toString('utf-8');
    console.log('Decoded labels:\n', decoded);

    // 3. Replace 5000 with 80
    const updated = decoded.replace(/5000/g, '80');
    console.log('\nUpdated labels:\n', updated);

    // 4. Encode back to base64
    const encoded = Buffer.from(updated).toString('base64');

    // 5. PATCH application
    console.log('PATCHing custom labels...');
    const patchRes = await fetch(`${baseUrl}/applications/${APP_UUID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        custom_labels: encoded
      })
    });
    console.log('PATCH status:', patchRes.status);
    const patchData = await patchRes.json();
    console.log('PATCH response:', JSON.stringify(patchData));

    if (patchRes.ok) {
      // 6. Restart/redeploy app
      console.log('Triggering restart...');
      const restartRes = await fetch(`${baseUrl}/applications/${APP_UUID}/restart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Restart status:', restartRes.status);
      const restartData = await restartRes.json();
      console.log('Restart response:', JSON.stringify(restartData));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
