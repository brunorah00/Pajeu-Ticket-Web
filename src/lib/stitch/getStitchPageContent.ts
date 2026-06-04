import { readFile } from 'fs/promises';
import path from 'path';

export type StitchScreen = 'home' | 'programacao' | 'detalhes-filme' | 'comprar-ingresso';

const SCREENS: StitchScreen[] = ['home', 'programacao', 'detalhes-filme', 'comprar-ingresso'];

export function isStitchScreen(value: string): value is StitchScreen {
  return (SCREENS as string[]).includes(value);
}

/** Extrai <main>…</main>, footer e bottom nav — sem header/drawer do Stitch. */
function extractPageContent(html: string): string {
  const mainStart = html.indexOf('<main');
  if (mainStart === -1) return '';

  const scriptStart = html.indexOf('<script', mainStart);
  const end = scriptStart === -1 ? html.lastIndexOf('</body>') : scriptStart;
  if (end === -1) return html.slice(mainStart);

  return html.slice(mainStart, end).trim();
}

function rewriteLinks(fragment: string): string {
  let out = fragment
    .replace(/href="#"\s*>\s*Programação/gi, 'href="/programacao">Programação')
    .replace(/href="#"\s*>\s*Comprar [Ii]ngresso/g, 'href="/ingressos/comprar">Comprar Ingresso')
    .replace(/href="#"\s*>\s*Página Inicial/gi, 'href="/">Página Inicial')
    .replace(/href="#"\s*>\s*Ver programação/gi, 'href="/programacao">Ver programação')
    .replace(
      /href="#"\s*>\s*Comprar ingressos/gi,
      'href="/ingressos/comprar">Comprar ingressos',
    );

  // Bottom nav: primeiro link (home), theaters, ingressos
  out = out.replace(
    /<a class="flex flex-col items-center justify-center text-primary[^"]*" href="#"/,
    '<a class="flex flex-col items-center justify-center text-primary active:scale-95 transition-transform" href="/"',
  );
  const bottomNavTheaters = /<a class="flex flex-col items-center justify-center text-on-surface-variant[^"]*" href="#">\s*<span class="material-symbols-outlined">theaters<\/span>/;
  out = out.replace(
    bottomNavTheaters,
    '<a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform" href="/programacao"><span class="material-symbols-outlined">theaters</span>',
  );
  const bottomNavTickets = /<a class="flex flex-col items-center justify-center text-on-surface-variant[^"]*" href="#">\s*<span class="material-symbols-outlined">local_activity<\/span>/;
  out = out.replace(
    bottomNavTickets,
    '<a class="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform" href="/ingressos/comprar"><span class="material-symbols-outlined">local_activity</span>',
  );

  return out;
}

export async function getStitchPageContent(screen: StitchScreen): Promise<string> {
  const filePath = path.join(process.cwd(), 'stitch-downloads', screen, 'code.html');
  const html = await readFile(filePath, 'utf8');
  return rewriteLinks(extractPageContent(html));
}
