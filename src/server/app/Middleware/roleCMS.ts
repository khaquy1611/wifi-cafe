import { Request, Response, NextFunction } from 'express';
import { roleAdmin } from '@sservice/index';

const roleCMS = async (req: Request, res: Response, next: NextFunction) => {
    const admin = await roleAdmin(req, res, next);
    req.body.cmsAdminUser = admin;
    next();
};

export default roleCMS;
