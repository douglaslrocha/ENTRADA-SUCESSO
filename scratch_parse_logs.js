const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';
const DEPLOY_UUID = 'vmnqvc7g4yjff7j5h5u08cvp';

async function run() {
  try {
    const res = await fetch(`${baseUrl}/deployments/${DEPLOY_UUID}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });
    const data = await res.json();
    if (data.logs) {
      // logs are JSON stringified inside or array?
      // Let's parse them if they are in JSON structure or print them line by line
      try {
        const parsed = JSON.parse(data.logs);
        console.log(`Parsed logs array with ${parsed.length} entries.`);
        // print entries with error or the last 30 entries
        const last30 = parsed.slice(-50);
        for (const entry of last30) {
          console.log(`[${entry.type}] ${entry.output}`);
        }
      } catch (e) {
        console.log("Failed to parse logs as JSON, printing raw tail:");
        console.log(data.logs.slice(-3000));
      }
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
run();
