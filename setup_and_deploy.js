const token = '1|focex1WgqmsLIJiK2j71mdauordKCLRbiIvyaSOk6806c60f';
const baseUrl = 'http://187.127.3.42:8000/api/v1';

// Credenciais que obtivemos do Supabase
const POSTGRES_PASSWORD = 'ptUtQmv787k3fXI4uCW3rjOybzR9lJrM';
// O backend roda no mesmo docker network, por isso o host é o nome do container: supabase-db
// A porta interna é 5432
const DATABASE_URL = `postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db:5432/postgres`;

// UUID do aplicativo ENTRADA SUCESSO que já existe no Coolify
const APP_UUID = 'hp87d540zadxizjfn5sgiffx';

async function run() {
  console.log('=== CONFIGURANDO VARIÁVEIS DE AMBIENTE DO APP ===');
  console.log('DATABASE_URL:', DATABASE_URL);
  console.log('');

  // 1. Definir todas as env vars necessárias
  const envVars = [
    { key: 'DATABASE_URL', value: DATABASE_URL },
    { key: 'PORT', value: '5000' },
    { key: 'HOST', value: '0.0.0.0' },
    { key: 'NODE_ENV', value: 'production' },
    { key: 'JWT_SECRET', value: 'dlr-personal-os-entrada-sucesso-2026' }
  ];

  for (const env of envVars) {
    try {
      const res = await fetch(`${baseUrl}/applications/${APP_UUID}/envs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ key: env.key, value: env.value, is_preview: false })
      });
      const data = await res.json();
      console.log(`✓ ENV SET: ${env.key} → Status ${res.status}`);
      if (!res.ok) {
        console.log('  Error:', JSON.stringify(data));
      }
    } catch (err) {
      console.error(`✗ Erro ao setar ${env.key}:`, err.message);
    }
  }

  console.log('');
  console.log('=== CONFIGURANDO DOCKERFILE ===');
  // 2. Garantir que o app use Dockerfile e expose porta 80 (nginx dentro)
  try {
    const patchRes = await fetch(`${baseUrl}/applications/${APP_UUID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        build_pack: 'dockerfile',
        ports_exposes: '80',
        dockerfile_location: '/Dockerfile'
      })
    });
    const patchData = await patchRes.json();
    console.log(`App PATCH Status: ${patchRes.status}`);
    if (!patchRes.ok) {
      console.log('PATCH error:', JSON.stringify(patchData));
    } else {
      console.log('✓ App configurado para usar Dockerfile e expor porta 80');
    }
  } catch (err) {
    console.error('Erro ao atualizar app:', err.message);
  }

  console.log('');
  console.log('=== DISPARANDO DEPLOY ===');
  // 3. Disparar deploy
  try {
    const deployRes = await fetch(`${baseUrl}/applications/${APP_UUID}/start`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    const deployData = await deployRes.json();
    console.log(`Deploy Status: ${deployRes.status}`);
    console.log('Deploy Response:', JSON.stringify(deployData, null, 2));
  } catch (err) {
    console.error('Erro ao disparar deploy:', err.message);
  }
}

run();
