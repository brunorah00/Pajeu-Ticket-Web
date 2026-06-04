export type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'CLIENTE';

export type AuthUser = {
  token: string;
  refreshToken: string;
  login: string;
  nome: string;
  role: UserRole;
};

export type LoginPayload = {
  login: string;
  senha: string;
};

export type CadastroPayload = {
  nome: string;
  login: string;
  senha: string;
};
