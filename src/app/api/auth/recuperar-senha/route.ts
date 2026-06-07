import { NextResponse } from 'next/server';
import { proxyAuthPost, apiMessage } from '@/lib/api/auth-proxy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ok, status, data } = await proxyAuthPost('/auth/recuperar-senha', body);

    if (!ok) {
      return NextResponse.json(
        { message: data.message ?? 'Não foi possível processar a solicitação.' },
        { status },
      );
    }

    return NextResponse.json({
      message: apiMessage(
        data,
        'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha em alguns minutos.',
      ),
    });
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar à API de autenticação.' },
      { status: 503 },
    );
  }
}
