const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

// Update DATABASE_URL to use the host public IP
const DATABASE_URL = 'postgresql://postgres:ptUtQmv787k3fXI4uCW3rjOybzR9lJrM@187.127.3.42:5432/postgres';

async function run() {
  try {
    // Get application envs to find the DATABASE_URL env uuid
    const envsRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const envs = await envsRes.json();
    const dbUrlEnv = envs.find(e => e.key === 'DATABASE_URL' && !e.is_preview);

    if (dbUrlEnv) {
      console.log('Found existing DATABASE_URL env variable. Updating it...');
      const updateRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs/${dbUrlEnv.uuid}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          value: DATABASE_URL
        })
      });
      console.log('Update Env Status:', updateRes.status);
    } else {
      console.log('DATABASE_URL not found. Creating it...');
      const createRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          key: 'DATABASE_URL',
          value: DATABASE_URL,
          is_preview: false
        })
      });
      console.log('Create Env Status:', createRes.status);
    }

    // Trigger redeploy of the application
    console.log('Redeploying application...');
    const deployRes = await fetch(`${baseUrl}/applications/${APP_UUID}/start`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    console.log('Redeploy Status:', deployRes.status);
    const deployData = await deployRes.json();
    console.log('Deploy Response:', JSON.stringify(deployData));
  } catch (err) {
    console.error(err);
  }
}
run();
