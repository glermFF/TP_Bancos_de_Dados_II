import type { Request, Response, NextFunction } from 'express';
const UserService = require('../services/UserService');

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const propriedades = req.body;
        const novoUsuario = await UserService.createUser(propriedades);
        res.status(201).json(novoUsuario);
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, username } = req.body;
        const usuarioAtualizado = await UserService.updateUserData(id, name, username);
        res.status(200).json(usuarioAtualizado);
    } catch (error) {
        next(error);
    }
};

export = {
    createUser,
    updateUser
};
