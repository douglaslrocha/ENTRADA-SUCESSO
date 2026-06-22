const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const SERVICE_UUID = 'x66wbwnbulrcp8shg16zcqra';

async function run() {
  try {
    // 1. Get service
    const res = await fetch(`${baseUrl}/services/${SERVICE_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    let yaml = service.docker_compose_raw;

    // 2. Add ports to supabase-db
    if (!yaml.includes("5432:5432")) {
      // Find supabase-db: block and insert ports
      yaml = yaml.replace("supabase-db:\n    image: 'supabase/postgres:15.8.1.085'", "supabase-db:\n    image: 'supabase/postgres:15.8.1.085'\n    ports:\n      - '5432:5432'");
      console.log('Modified YAML to expose 5432.');
    } else {
      console.log('YAML already has 5432:5432.');
    }

    // Base64 encode the YAML
    const base64Yaml = Buffer.from(yaml).toString('base64');

    // 3. Patch service
    const patchRes = await fetch(`${baseUrl}/services/${SERVICE_UUID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        docker_compose_raw: base64Yaml
      })
    });
    console.log('Patch Status:', patchRes.status);
    const patchData = await patchRes.json();
    console.log('Patch Data:', JSON.stringify(patchData).slice(0, 500));

    // 4. Restart service - to apply compose changes we should call restart or stop then start
    console.log('Stopping service...');
    const stopRes = await fetch(`${baseUrl}/services/${SERVICE_UUID}/stop`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stop Status:', stopRes.status);

    // Wait a few seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Starting service...');
    const restartRes = await fetch(`${baseUrl}/services/${SERVICE_UUID}/start`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Start Status:', restartRes.status);
    const restartData = await restartRes.json();
    console.log('Start Data:', JSON.stringify(restartData));
  } catch (err) {
    console.error(err);
  }
}
run();
