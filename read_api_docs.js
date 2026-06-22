const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/api-docs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const html = await res.text();
    // Look for any string containing JSON or paths or config
    const lines = html.split('\n');
    for (const line of lines) {
      if (line.includes('url') || line.includes('spec') || line.includes('SwaggerUIBundle')) {
        console.log(line.trim());
      }
    }
  } catch (err) {
    console.error(err);
  }
}
run();
