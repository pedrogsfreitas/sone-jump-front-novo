import { ApiError } from "../api";
import { createMockToken, createUser, findByUsername, findConflict, type ConflictField } from "../mock/mock-users-db";

// Endpoints reais (voltam a ser usados quando o back for plugado de novo):
// register -> POST /api/login/register
// login    -> POST /api/login/authenticate

const CONFLICT_MESSAGES: Record<ConflictField, string> = {
  username: "Este nome de usuário já está em uso.",
  email: "Este e-mail já está cadastrado.",
  cpf: "Este CPF já está cadastrado.",
};

export type RegisterParams = {
  email: string;
  username: string;
  password: string;
  fullname: string;
  cpf: string;
  phone: string;
};

export type AuthParams = {
    username: string;
    password: string;
};

export type RegisterResponse = {
    id: number;
    message: string;
};

export type AuthResponse = {
    id: number;
    token: string;
};

// MOCK: sem back-end no momento — grava o cadastro em localStorage.
// Mesma assinatura da versão real (params in, RegisterResponse out), então
// Register.tsx não precisa saber que a origem dos dados mudou.
export async function register(params: RegisterParams): Promise<RegisterResponse> {
    // Pequeno atraso só para o loading ("Criando conta...") não piscar instantâneo.
    await new Promise((resolve) => setTimeout(resolve, 500));

    const conflict = findConflict(params.username, params.email, params.cpf);
    if (conflict) {
        throw new Error(CONFLICT_MESSAGES[conflict]);
    }

    const user = createUser({
        fullname: params.fullname,
        username: params.username,
        cpf: params.cpf,
        phone: params.phone,
        email: params.email,
        password: params.password,
        role: "STUDENT",
    });

    return { id: user.id, message: "Usuário criado com sucesso." };
}

// MOCK: sem back-end no momento — autentica contra o localStorage e devolve
// um token no mesmo formato que auth-storage.ts sabe ler (ver mock-users-db.ts).
export async function login(params: AuthParams): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = findByUsername(params.username);
    if (!user || user.password !== params.password) {
        // Mensagem genérica de propósito — não revela se foi o usuário ou a senha.
        throw new ApiError("Usuário ou senha inválidos.", 401);
    }

    return { id: user.id, token: createMockToken(user) };
}