import { NextResponse } from 'next/server';
import { proxyAuthPost, apiMessage } from '@/lib/api/auth-proxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ok, status, data } = await proxyAuthPost('/auth/redefinir-senha', body);

    if (!ok) {
      return NextResponse.json(
        { message: data.message ?? 'Não foi possível redefinir a senha.' },
        { status },
      );
    }

    return NextResponse.json({
      message: apiMessage(data, 'Senha redefinida com sucesso.'),
    });
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar à API de autenticação.' },
      { status: 503 },
    );
  }
}
