import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel';
import { signToken } from '../middlewares/authenticate';
import { ApiError } from '../middlewares/errorHandler';
import type { PublicUser } from '../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthResult {
  token: string;
  user: PublicUser;
}

export async function register(input: { name?: string; username?: string; email?: string; password?: string }): Promise<AuthResult> {
  const name = input.name?.trim() ?? '';
  const username = input.username?.trim().toLowerCase() ?? '';
  const email = input.email?.trim().toLowerCase() ?? '';
  const password = input.password ?? '';
  if (name.length < 2) throw new ApiError(400, 'O nome precisa ter pelo menos 2 caracteres');
  if (!/^[a-z0-9_.-]{3,24}$/.test(username)) {
    throw new ApiError(400, 'O usuário deve ter 3–24 caracteres (letras, números, _ . -)');
  }
  if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Endereço de e-mail inválido');
  if (password.length < 6) throw new ApiError(400, 'A senha precisa ter pelo menos 6 caracteres');
  const [byEmail, byUsername] = await Promise.all([
    userModel.findByEmailOrUsername(email),
    userModel.findByEmailOrUsername(username),
  ]);
  if (byEmail) throw new ApiError(409, 'E-mail já cadastrado');
  if (byUsername) throw new ApiError(409, 'Nome de usuário já em uso');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({ name, username, email, passwordHash });
  return { token: signToken({ sub: user.id, username: user.username }), user: userModel.toPublic(user) };
}

export async function login(input: { identifier?: string; password?: string }): Promise<AuthResult> {
  const identifier = input.identifier?.trim().toLowerCase() ?? '';
  const password = input.password ?? '';
  if (!identifier || !password) throw new ApiError(400, 'Informe e-mail/usuário e senha');
  const user = await userModel.findByEmailOrUsername(identifier);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Credenciais inválidas');
  }
  return { token: signToken({ sub: user.id, username: user.username }), user: userModel.toPublic(user) };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await userModel.findById(userId);
  if (!user) throw new ApiError(404, 'Usuário não encontrado');
  return userModel.toPublic(user);
}
