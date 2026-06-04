import { authFetch } from './auth-fetch';
import type { Funcionario, FuncionarioRequest } from './types';

export function listarFuncionarios(token: string): Promise<Funcionario[]> {
  return authFetch<Funcionario[]>('/usuarios/funcionarios', { token });
}

export function cadastrarFuncionario(
  token: string,
  data: FuncionarioRequest,
): Promise<Funcionario> {
  return authFetch<Funcionario>('/usuarios/funcionarios', {
    token,
    method: 'POST',
    json: data,
  });
}

export function excluirFuncionario(token: string, id: number): Promise<void> {
  return authFetch<void>(`/usuarios/funcionarios/${id}`, { token, method: 'DELETE' });
}

export function redefinirSenhaFuncionario(
  token: string,
  id: number,
  senha: string,
): Promise<void> {
  return authFetch<void>(`/usuarios/funcionarios/${id}/senha`, {
    token,
    method: 'PUT',
    json: { senha },
  });
}
