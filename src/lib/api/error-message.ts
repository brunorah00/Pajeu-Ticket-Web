import { ApiRequestError } from './http';
import { getApiBaseUrl } from './config';

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 0) {
      return error.message;
    }
    if (error.status === 401 || error.status === 403) {
      return 'Acesso negado pela API. Verifique autenticação.';
    }
    return error.message;
  }

  return `Não foi possível conectar à API em ${getApiBaseUrl()}. Inicie o backend (porta 8080) e confira o PostgreSQL.`;
}
