import * as distilleryModel from '../models/distilleryModel';
import { ApiError } from '../middlewares/errorHandler';
import type { Distillery, Paginated } from '../types';

export async function list(pageRaw?: number, pageSizeRaw?: number): Promise<Paginated<Distillery>> {
  const page = Math.max(Math.floor(pageRaw || 1), 1);
  const pageSize = Math.min(Math.max(Math.floor(pageSizeRaw || 100), 1), 100);
  const [items, total] = await Promise.all([
    distilleryModel.listDistilleries((page - 1) * pageSize, pageSize),
    distilleryModel.countDistilleries(),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1) };
}

export async function getById(id: string): Promise<Distillery> {
  const distillery = await distilleryModel.findById(id);
  if (!distillery) throw new ApiError(404, 'Alambique não encontrado');
  return distillery;
}

export async function suggest(
  userId: string,
  input: { name?: string; category?: string; city?: string; latitude?: number; longitude?: number },
): Promise<Distillery> {
  const name = input.name?.trim() ?? '';
  const city = input.city?.trim() ?? '';
  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  if (name.length < 3) throw new ApiError(400, 'O nome do alambique precisa ter pelo menos 3 caracteres');
  if (city.length < 2) throw new ApiError(400, 'Informe a cidade');
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new ApiError(400, 'Latitude inválida');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new ApiError(400, 'Longitude inválida');
  }
  return distilleryModel.suggestDistillery({
    name,
    city,
    latitude,
    longitude,
    category: input.category?.trim() || 'Branca',
    userId,
  });
}

export async function stats(): Promise<distilleryModel.GraphStats> {
  return distilleryModel.getStats();
}
