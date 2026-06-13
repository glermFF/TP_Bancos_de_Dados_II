import * as reviewModel from '../models/reviewModel';
import * as distilleryModel from '../models/distilleryModel';
import { ApiError } from '../middlewares/errorHandler';
import type { Review } from '../types';

export async function latest(limit?: number): Promise<Review[]> {
  const n = Math.min(Math.max(Number(limit) || 12, 1), 50);
  return reviewModel.listLatest(n);
}

export async function byDistillery(distilleryId: string): Promise<Review[]> {
  return reviewModel.listByDistillery(distilleryId);
}

export async function create(
  userId: string,
  input: { distilleryId?: string; title?: string; body?: string; rating?: number },
): Promise<Review> {
  const distilleryId = input.distilleryId ?? '';
  const title = input.title?.trim() ?? '';
  const body = input.body?.trim() ?? '';
  const rating = Number(input.rating);
  if (!distilleryId) throw new ApiError(400, 'Informe o alambique (distilleryId)');
  if (title.length < 3) throw new ApiError(400, 'O título precisa ter pelo menos 3 caracteres');
  if (body.length < 10) throw new ApiError(400, 'O texto da avaliação precisa ter pelo menos 10 caracteres');
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw new ApiError(400, 'A nota deve estar entre 0 e 5');
  }
  const distillery = await distilleryModel.findById(distilleryId);
  if (!distillery) throw new ApiError(404, 'Alambique não encontrado');
  return reviewModel.createReview({ userId, distilleryId, title, body, rating });
}
