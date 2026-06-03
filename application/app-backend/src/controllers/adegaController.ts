import type { Request, Response, NextFunction } from 'express';
const { Router } = require('express');
const AdegaService = require('../services/AdegaService');

const listAdegas = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const adegas = await AdegaService.listAdegas();
        res.status(200).json(adegas);
    } catch (error) {
        next(error);
    }
};

const createAdega = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const properties = req.body;
        const newAdega = await AdegaService.createAdega(properties);
        res.status(201).json(newAdega);
    } catch (error) {
        next(error);
    }
}

const updateAdega = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const properties = req.body;
        const updatedAdega = await AdegaService.updateAdega(id, properties);
        res.status(200).json(updatedAdega);
    } catch (error) {
        next(error);
    }
}

export = {
    listAdegas,
    createAdega,
    updateAdega
};
