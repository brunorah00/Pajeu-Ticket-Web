export type Filme = {
  id: number;
  titulo: string;
  genero: string;
  classificacao: string;
  duracao: number;
  sinopse: string | null;
  status: boolean;
  urlImagem?: string | null;
};

export type FilmeRequest = {
  titulo: string;
  genero: string;
  classificacao: string;
  duracao: number;
  sinopse?: string | null;
  status: boolean;
};

export type Produto = {
  id: number;
  nome: string;
  categoria: string;
  descricao?: string | null;
  urlImagem?: string | null;
  preco: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
};

export type ProdutoRequest = {
  nome: string;
  categoria: string;
  descricao?: string | null;
  preco: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
};

export type DashboardData = {
  totalVendidoHoje: number;
  totalIngressosVendidosHoje: number;
  totalProdutosVendidosHoje: number;
  quantidadeFilmes: number;
  quantidadeSessoes: number;
  quantidadeProdutos: number;
  estoqueBomboniere: Produto[];
  produtosComEstoqueBaixo: { id: number; nome: string; quantidadeEstoque: number; estoqueMinimo: number }[];
  produtosMaisVendidos: { produtoId: number; nome: string; quantidadeVendida: number }[];
  sessoesMaisVendidas: { sessaoId: number; filmeTitulo: string; quantidadeVendida: number }[];
};

export type Funcionario = {
  id: number;
  nome: string;
  login: string;
  role: string;
};

export type FuncionarioRequest = {
  nome: string;
  login: string;
  senha: string;
};

export type Sessao = {
  id: number;
  filme: Filme;
  data: string;
  horario: string;
  valorIngresso: number;
  lugaresDisponiveis: number;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type VendaIngressoRequest = {
  sessaoId: number;
  quantidade: number;
};

export type VendaIngresso = {
  id: number;
  sessao: Sessao;
  quantidade: number;
  valorTotal: number;
  dataVenda: string;
};

export type ApiError = {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  fields?: Record<string, string>;
};
