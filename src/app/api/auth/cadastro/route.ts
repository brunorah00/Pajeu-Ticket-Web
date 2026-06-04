import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${getApiBaseUrl()}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        nome: body.nome,
        login: body.login,
        senha: body.senha,
        role: 'CLIENTE',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? 'Falha no cadastro', fields: data.fields },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível conectar à API de cadastro.' },
      { status: 503 },
    );
  }
}
