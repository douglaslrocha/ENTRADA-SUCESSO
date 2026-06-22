const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  try {
    // 1. Get current envs
    const envsRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const envs = await envsRes.json();
    const portEnv = envs.find(e => e.key === 'PORT' && !e.is_preview);

    if (portEnv) {
      console.log('Found PORT env variable. Patching to 80...');
      const updateRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs/${portEnv.uuid}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          value: '80'
        })
      });
      console.log('Update Status:', updateRes.status);
    }

    // Also update PORT in preview env if present
    const portPreviewEnv = envs.find(e => e.key === 'PORT' && e.is_preview);
    if (portPreviewEnv) {
      console.log('Found preview PORT env variable. Patching to 80...');
      const updateRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs/${portPreviewEnv.uuid}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          value: '80'
        })
      });
      console.log('Preview Update Status:', updateRes.status);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
