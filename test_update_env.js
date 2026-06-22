const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';
const DATABASE_URL = 'postgresql://postgres:ptUtQmv787k3fXI4uCW3rjOybzR9lJrM@187.127.3.42:5432/postgres';

async function run() {
  try {
    // 1. Get current envs
    const envsRes = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const envs = await envsRes.json();
    const dbUrlEnv = envs.find(e => e.key === 'DATABASE_URL' && !e.is_preview);
    
    if (!dbUrlEnv) {
      console.log('DATABASE_URL not found.');
      return;
    }
    
    console.log('Found DATABASE_URL env with UUID:', dbUrlEnv.uuid);

    // Try patching /applications/envs/{uuid}
    const res1 = await fetch(`${baseUrl}/applications/envs/${dbUrlEnv.uuid}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ value: DATABASE_URL })
    });
    console.log('PATCH /applications/envs/{uuid} status:', res1.status);
    if (res1.ok) {
      console.log('Successfully updated!');
      return;
    }

    // Try patching /envs/{uuid}
    const res2 = await fetch(`${baseUrl}/envs/${dbUrlEnv.uuid}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ value: DATABASE_URL })
    });
    console.log('PATCH /envs/{uuid} status:', res2.status);
    if (res2.ok) {
      console.log('Successfully updated!');
      return;
    }

    // Try POST to /applications/{APP_UUID}/envs to overwrite
    const res3 = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ key: 'DATABASE_URL', value: DATABASE_URL, is_preview: false })
    });
    console.log('POST /applications/{APP_UUID}/envs status:', res3.status);
    const data3 = await res3.json();
    console.log('POST Response:', JSON.stringify(data3));
  } catch (err) {
    console.error(err);
  }
}
run();
