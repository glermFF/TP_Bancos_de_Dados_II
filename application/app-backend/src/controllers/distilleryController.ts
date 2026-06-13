import { handle } from '../lib/handle';
import * as distilleryService from '../services/distilleryService';
import * as reviewService from '../services/reviewService';

export const list = handle((req) => distilleryService.list(Number(req.query.page), Number(req.query.pageSize)));

export const getById = handle(async (req) => {
  const distillery = await distilleryService.getById(String(req.params.id));
  return { ...distillery, reviews: await reviewService.byDistillery(distillery.id) };
});

export const suggest = handle((req) => distilleryService.suggest(req.auth!.sub, req.body ?? {}), 201);

export const stats = handle(() => distilleryService.stats());
