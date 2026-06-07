export type Filme = {
  id: number;
  titulo: string;
  genero: string;
  classificacao: string;
  duracao: number;
  sinopse: string | null;
  status: boolean;
  urlImagem?: string | null;
  quantidadeVendasIngresso?: number;
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
  /** true após horário + 10 min (vendas encerradas). */
  encerrada?: boolean;
};

export type SessaoRequest = {
  filmeId: number;
  salaId?: number;
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
  quantidade?: number;
  assentos?: string[];
};

export type VendaIngresso = {
  id: number;
  codigoPedido?: string | null;
  status?: StatusPedidoBomboniere;
  clienteNome?: string | null;
  clienteLogin?: string | null;
  sessao: Sessao;
  quantidade: number;
  valorTotal: number;
  dataVenda: string;
  assentos?: string[];
};

export type VendaProdutoItemRequest = {
  produtoId: number;
  quantidade: number;
};

export type VendaProdutoRequest = {
  itens: VendaProdutoItemRequest[];
};

export type StatusPedidoBomboniere =
  | 'PENDENTE'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type VendaProdutoItem = {
  id: number;
  produto: Produto;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

export type VendaProduto = {
  id: number;
  codigoPedido?: string | null;
  status?: StatusPedidoBomboniere;
  clienteNome?: string | null;
  clienteLogin?: string | null;
  valorTotal: number;
  dataVenda: string;
  itens?: VendaProdutoItem[];
};

export type ApiError = {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  path?: string;
  fields?: Record<string, string>;
};
