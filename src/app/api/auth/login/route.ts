import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/api/config';
import { ApiRequestError } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data.message ?? 'Credenciais inválidas' },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return NextResponse.json({ message: err.message }, { status: err.status || 500 });
    }
    return NextResponse.json(
      { message: 'Não foi possível conectar à API de autenticação.' },
      { status: 503 },
    );
  }
}
