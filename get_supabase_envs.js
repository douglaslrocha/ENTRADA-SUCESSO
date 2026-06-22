const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra/envs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const envs = await res.json();
    console.log('--- SUPABASE ENV VARIABLES ---');
    console.log(JSON.stringify(envs, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
