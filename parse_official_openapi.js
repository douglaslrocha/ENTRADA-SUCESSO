async function run() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/coollabsio/coolify/v4.x/openapi.json');
    if (!res.ok) {
      console.error('Error fetching official openapi.json:', res.status);
      return;
    }
    const data = await res.json();
    console.log('Paths in official spec:');
    const paths = Object.keys(data.paths || {});
    for (const p of paths) {
      if (p.includes('/services') || p.includes('/databases') || p.includes('/applications')) {
        console.log(`- ${p}: ${Object.keys(data.paths[p]).join(', ')}`);
        if (p === '/api/v1/services' || p === '/api/v1/databases/postgresql' || p === '/api/v1/services/create') {
          console.log(`Detail for ${p}:`, JSON.stringify(data.paths[p], null, 2));
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
