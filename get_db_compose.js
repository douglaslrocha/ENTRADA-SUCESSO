const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/services/x66wbwnbulrcp8shg16zcqra`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const service = await res.json();
    const yaml = service.docker_compose_raw;
    // Find the supabase-db block in YAML
    const lines = yaml.split('\n');
    let output = false;
    let count = 0;
    for (const line of lines) {
      if (line.includes('supabase-db:')) {
        output = true;
      }
      if (output) {
        console.log(line);
        count++;
        if (count > 30) break; // print 30 lines
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
