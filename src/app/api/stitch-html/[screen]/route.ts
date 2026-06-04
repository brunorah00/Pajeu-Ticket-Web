import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const SCREENS = new Set(['home', 'programacao', 'detalhes-filme', 'comprar-ingresso']);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ screen: string }> },
) {
  const { screen } = await params;
  if (!SCREENS.has(screen)) {
    return NextResponse.json({ error: 'Tela não encontrada' }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'stitch-downloads', screen, 'code.html');
  try {
    const html = await readFile(filePath, 'utf8');
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Execute npm run fetch:stitch para baixar os HTMLs.' },
      { status: 404 },
    );
  }
}
