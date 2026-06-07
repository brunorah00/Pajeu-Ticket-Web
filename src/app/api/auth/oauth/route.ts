import { NextResponse } from 'next/server';
import { proxyAuthPost } from '@/lib/api/auth-proxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ok, status, data } = await proxyAuthPost('/auth/oauth', body);

    if (!ok) {
      return NextResponse.json(
        { message: data.message ?? 'Falha no login social.' },
        { status },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar à API de autenticação.' },
      { status: 503 },
    );
  }
}
