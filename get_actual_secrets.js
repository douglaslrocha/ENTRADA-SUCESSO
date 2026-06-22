const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra/envs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const envs = await res.json();
    console.log('--- EVALUATED SECRETS ---');
    
    // We want to print any key containing PASSWORD, KEY, USER, DB, HOST
    for (const env of envs) {
      const k = env.key;
      const val = env.value;
      const realVal = env.real_value;
      
      // Let's print keys of interest
      if (k.includes('PASS') || k.includes('KEY') || k.includes('USER') || k.includes('DB') || k.includes('PORT') || k.includes('HOST') || k.includes('SECRET')) {
        console.log(`${k} = ${val} | Real Value: ${realVal}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
