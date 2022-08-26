import { Request, Response, NextFunction } from 'express';
import { roleMiniapp } from '@sservice/index';

const roleMiniApp = async (req: Request, res: Response, next: NextFunction) => {
    const admin = await roleMiniapp(req, res, next);
    req.body.miniAppUser = admin;
    next();
};

export default roleMiniApp;
