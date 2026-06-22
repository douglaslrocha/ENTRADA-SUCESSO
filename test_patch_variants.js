const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';
const DATABASE_URL = 'postgresql://postgres:ptUtQmv787k3fXI4uCW3rjOybzR9lJrM@187.127.3.42:5432/postgres';

async function run() {
  try {
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

    // Try variant 1: PATCH to /applications/{APP_UUID}/envs with key/value
    const res1 = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ key: 'DATABASE_URL', value: DATABASE_URL, uuid: dbUrlEnv.uuid })
    });
    console.log('PATCH /applications/{APP_UUID}/envs status:', res1.status);
    const data1 = await res1.json();
    console.log('PATCH /applications/{APP_UUID}/envs body:', JSON.stringify(data1));

    // Try variant 2: PATCH to /applications/env/{uuid}
    const res2 = await fetch(`${baseUrl}/applications/env/${dbUrlEnv.uuid}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ value: DATABASE_URL })
    });
    console.log('PATCH /applications/env/{uuid} status:', res2.status);

    // Try variant 3: PATCH to /envs with uuid/value
    const res3 = await fetch(`${baseUrl}/envs`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ uuid: dbUrlEnv.uuid, value: DATABASE_URL })
    });
    console.log('PATCH /envs status:', res3.status);
  } catch (err) {
    console.error(err);
  }
}
run();
