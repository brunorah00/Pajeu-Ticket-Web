/**
 * Baixa HTML e screenshots das telas do projeto Stitch "Portal do Cinema".
 *
 * Autenticação (uma das opções):
 *   1. STITCH_API_KEY — Stitch Settings → API Key (recomendado)
 *   2. OAuth em ~/.gemini/oauth_creds.json + GOOGLE_CLOUD_PROJECT (quota GCP)
 */
import { StitchToolClient } from '@google/stitch-sdk';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { createWriteStream } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

const PROJECT_ID = '3154062614796903639';

const SCREENS = [
  { name: 'home', screenId: 'f7625b76719d4396ba6445eda972b431', title: 'Home - Cine São José' },
  { name: 'programacao', screenId: '167f31e6a40b4e779eca25c9f7ffefdc', title: 'Programação - Cine São José' },
  { name: 'detalhes-filme', screenId: '9c5bd8111abb43e9abd3f35acfdd854e', title: 'Detalhes do Filme - Cine São José' },
  { name: 'comprar-ingresso', screenId: '9dc17d80e7274cfb97574b551e292a93', title: 'Comprar Ingresso - Cine São José' },
];

const OUT_DIR = './stitch-downloads';
const OAUTH_PATH = process.env.STITCH_OAUTH_PATH || `${process.env.HOME}/.gemini/oauth_creds.json`;

function loadOAuthToken() {
  if (!existsSync(OAUTH_PATH)) return null;
  const creds = JSON.parse(readFileSync(OAUTH_PATH, 'utf8'));
  if (!creds.access_token) return null;
  const expired = creds.expiry_date && Date.now() > creds.expiry_date;
  if (expired) {
    console.warn(`⚠ Token OAuth expirado (${new Date(creds.expiry_date).toISOString()}).`);
    console.warn('  Renove em stitch.withgoogle.com / Antigravity, ou use STITCH_API_KEY.\n');
    return null;
  }
  return creds.access_token;
}

function createClient() {
  const apiKey = process.env.STITCH_API_KEY;
  if (apiKey) {
    return new StitchToolClient({ apiKey });
  }

  const accessToken = process.env.STITCH_ACCESS_TOKEN || loadOAuthToken();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.STITCH_QUOTA_PROJECT;

  if (accessToken && projectId) {
    return new StitchToolClient({ accessToken, projectId });
  }

  if (accessToken && !projectId) {
    throw new Error(
      'OAuth sem projeto de quota. Defina GOOGLE_CLOUD_PROJECT (ID do projeto GCP) ou use STITCH_API_KEY.',
    );
  }

  throw new Error(
    'Defina STITCH_API_KEY (Stitch → perfil → Stitch Settings → API Key) ou renove o OAuth em ~/.gemini/oauth_creds.json.',
  );
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = createWriteStream(dest);
    proto
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          file.close();
          reject(new Error(`HTTP ${res.statusCode} ao baixar ${url}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        file.close();
        reject(err);
      });
  });
}

async function fetchScreen(client, screen) {
  const result = await client.callTool('get_screen', {
    projectId: PROJECT_ID,
    screenId: screen.screenId,
    name: `projects/${PROJECT_ID}/screens/${screen.screenId}`,
  });

  const screenDir = path.join(OUT_DIR, screen.name);
  mkdirSync(screenDir, { recursive: true });

  writeFileSync(path.join(screenDir, 'response.json'), JSON.stringify(result, null, 2));
  writeFileSync(
    path.join(screenDir, 'meta.json'),
    JSON.stringify({ title: screen.title, screenId: screen.screenId, projectId: PROJECT_ID }, null, 2),
  );

  const htmlUrl = result?.htmlCode?.downloadUrl;
  const imgUrl = result?.screenshot?.downloadUrl;

  if (htmlUrl) {
    await download(htmlUrl, path.join(screenDir, 'code.html'));
    console.log('  ✓ code.html');
  } else {
    console.log('  ⚠ HTML não disponível');
  }

  if (imgUrl) {
    await download(imgUrl, path.join(screenDir, 'screen.png'));
    console.log('  ✓ screen.png');
  } else {
    console.log('  ⚠ screenshot não disponível');
  }
}

async function main() {
  const client = createClient();
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Projeto Stitch: Portal do Cinema');
  console.log(`ID: ${PROJECT_ID}\n`);
  console.log('Conectando ao Stitch MCP...');
  await client.connect();
  console.log('Conectado.\n');

  for (const screen of SCREENS) {
    console.log(`→ ${screen.title}`);
    try {
      await fetchScreen(client, screen);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      writeFileSync(path.join(OUT_DIR, `${screen.name}-error.txt`), err.message);
    }
    console.log('');
  }

  // Design System (não é screen; vem de list_design_systems): asset-stub não é tela — buscar via list_design_systems
  console.log('→ Design System (Cinematic Noir)');
  try {
    const ds = await client.callTool('list_design_systems', { projectId: PROJECT_ID });
    const dsDir = path.join(OUT_DIR, 'design-system');
    mkdirSync(dsDir, { recursive: true });
    writeFileSync(path.join(dsDir, 'list.json'), JSON.stringify(ds, null, 2));
    console.log('  ✓ design-system/list.json');
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
  }

  await client.close();
  console.log(`\nArquivos em ${path.resolve(OUT_DIR)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
