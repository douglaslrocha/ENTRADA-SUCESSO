const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/api-docs`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      console.error('Error fetching docs:', res.status);
      return;
    }
    const data = await res.json();
    
    // Save raw swagger spec to file for inspection if needed
    console.log('Swagger spec paths:');
    const paths = Object.keys(data.paths || {});
    for (const p of paths) {
      if (p.includes('service') || p.includes('database') || p.includes('deploy') || p.includes('env')) {
        console.log(`- ${p}: ${Object.keys(data.paths[p]).join(', ')}`);
        
        // Show schema detail for POST /services or POST /databases
        if (p === '/api/v1/services' || p === '/api/v1/services/create') {
          console.log('Detail for', p, ':', JSON.stringify(data.paths[p], null, 2));
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
