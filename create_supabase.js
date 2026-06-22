const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  const payload = {
    server_uuid: 'zstns6zkvvl5rodlul2n0216',
    project_uuid: 'ud1i5mbmtzv5vaxvx81lwnc8',
    environment_uuid: 'ux6as55jq5peycf1725ziocn',
    type: 'supabase',
    name: 'supabase-selfhost',
    instant_deploy: true
  };

  try {
    const res = await fetch(`${baseUrl}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
