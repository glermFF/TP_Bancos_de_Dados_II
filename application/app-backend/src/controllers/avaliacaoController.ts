import type { Request, Response, NextFunction } from 'express';
const AvaliacaoService = require('../services/AvaliacaoService');

const listAvaliacoes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username } = req.params;
        const avaliacoes = await AvaliacaoService.listAvaliacoes(username);
        res.status(200).json(avaliacoes);
    } catch (error) {
        next(error);
    }
};

const createAvaliacao = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userUsername, adegaName, ...properties } = req.body;
        
        const novaAvaliacao = await AvaliacaoService.createAvaliacao(userUsername, adegaName, properties);
        res.status(201).json(novaAvaliacao);
    } catch (error) {
        next(error);
    }
};

export = {
    listAvaliacoes,
    createAvaliacao
};

