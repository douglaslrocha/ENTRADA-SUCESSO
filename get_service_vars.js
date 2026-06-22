const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    console.log('--- DB & AUTH ENVIRONMENT VARIABLES ---');
    
    // Check inside service.environment_variables or service.environmentVariables
    const envs = service.environment_variables || service.envs || [];
    for (const env of envs) {
      if (env.key.includes('PASS') || env.key.includes('USER') || env.key.includes('DB') || env.key.includes('PORT') || env.key.includes('KEY') || env.key.includes('SECRET')) {
        console.log(`${env.key}=${env.value}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
