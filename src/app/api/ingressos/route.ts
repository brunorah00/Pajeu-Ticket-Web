import { NextResponse } from 'next/server';
import { registrarVendaIngresso } from '@/lib/api/ingressos';
import { ApiRequestError } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const venda = await registrarVendaIngresso({
      sessaoId: Number(body.sessaoId),
      quantidade: Number(body.quantidade),
    });
    return NextResponse.json(venda, { status: 201 });
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return NextResponse.json(
        { message: err.message, fields: err.body?.fields },
        { status: err.status },
      );
    }
    return NextResponse.json({ message: 'Erro interno ao registrar venda' }, { status: 500 });
  }
}
