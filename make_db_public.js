const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  const dbUuid = 'figp9nqbeg77yb7shv1regwx';
  const payload = {
    is_public: true,
    public_port: 5432
  };
  try {
    const res = await fetch(`${baseUrl}/databases/${dbUuid}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('PATCH Status:', res.status);
    const data = await res.json();
    console.log('PATCH Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('PATCH Error:', err);
  }
}
run();
