const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/api-docs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const html = await res.text();
    // Look for endpoints or JSON references in Swagger UI html
    const matches = html.match(/[\w-/]+\.json|url\s*:\s*['"]([^'"]+)['"]/gi);
    console.log('Matches:', matches);
  } catch (err) {
    console.error(err);
  }
}
run();
