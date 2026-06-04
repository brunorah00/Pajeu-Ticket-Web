import { authFetch, authUpload } from './auth-fetch';
import type { PageResponse, Produto, ProdutoRequest } from './types';

export function listarProdutos(token: string, page = 0, size = 100): Promise<PageResponse<Produto>> {
  return authFetch<PageResponse<Produto>>('/produtos', {
    token,
    searchParams: { page, size, sort: 'categoria,asc' },
  });
}

export function cadastrarProduto(token: string, data: ProdutoRequest): Promise<Produto> {
  return authFetch<Produto>('/produtos', { token, method: 'POST', json: data });
}

export function atualizarProduto(token: string, id: number, data: ProdutoRequest): Promise<Produto> {
  return authFetch<Produto>(`/produtos/${id}`, { token, method: 'PUT', json: data });
}

export function excluirProduto(token: string, id: number): Promise<void> {
  return authFetch<void>(`/produtos/${id}`, { token, method: 'DELETE' });
}

export function uploadProdutoImagem(token: string, produtoId: number, file: File): Promise<Produto> {
  return authUpload<Produto>(`/produtos/${produtoId}/imagem`, token, file);
}

export function reporEstoque(token: string, produtoId: number, quantidade: number): Promise<Produto> {
  return authFetch<Produto>('/estoque/repor', {
    token,
    method: 'PUT',
    json: { produtoId, quantidade },
  });
}
