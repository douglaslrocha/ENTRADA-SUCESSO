async function run() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/coollabsio/coolify/v4.x/openapi.json');
    const data = await res.json();
    const servicePost = data.paths['/services']?.post;
    if (servicePost) {
      console.log('--- POST /services Schema ---');
      console.log(JSON.stringify(servicePost, null, 2));
    } else {
      console.log('Endpoint /services post not found in spec');
    }
  } catch (err) {
    console.error(err);
  }
}
run();
