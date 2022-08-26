import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { parseCookies } from 'nookies';
import { Admin } from '@smodel/index';
import { ROLE_GROUP_ADMIN, ROLE_SUPER_ADMIN } from '@sconfig/app';
import ErrorHandler from '@sexceptions/index';

export const roleAdmin = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const { tokenqr } = parseCookies({ req });
        const token = req.header('Authorization') || tokenqr;
        const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
        const admin = await Admin.findOne(
            { token: jwtToken.data, active: true },
            '-password -token -secret_pin -token_mini_app -device_token',
        );
        let group_id = '';
        let store_id = '';
        const { query, body } = req;
        if (body.group_id) {
            group_id = req.body.group_id;
        } else if (query.group_id) {
            group_id = query.group_id as string;
        }
        if (body.store_id) {
            store_id = body.store_id;
        } else if (query.store_id) {
            store_id = query.store_id as string;
        }
        if (admin) {
            if (admin.role === ROLE_SUPER_ADMIN) {
                return admin;
            }
            if (admin.role === ROLE_GROUP_ADMIN) {
                if (group_id && admin.groupStores && admin.groupStores.includes(group_id)) {
                    return admin;
                }
            } else if (admin.role === 'ADMIN') {
                if (store_id === '' && group_id && admin.groupStores && admin.groupStores.includes(group_id)) {
                    if (
                        admin.role_permissions &&
                        admin.role_permissions.includes(`${req.baseUrl}${req.route.path}:${req.method.toUpperCase()}`)
                    ) {
                        return admin;
                    }
                }
                if (
                    group_id &&
                    store_id &&
                    admin.stores &&
                    admin.groupStores &&
                    admin.stores.includes(store_id) &&
                    admin.groupStores.includes(group_id)
                ) {
                    if (
                        admin.role_permissions &&
                        admin.role_permissions.includes(`${req.baseUrl}${req.route.path}:${req.method.toUpperCase()}`)
                    ) {
                        return admin;
                    }
                }
            }
            throw new ErrorHandler({
                message: 'Admin này không có quyền truy cập route này',
                messageResponse: 'Mã xác thực không hợp lệ',
                name: 'JsonWebTokenError',
            });
        }
        throw new ErrorHandler({
            message: 'Không tìm thấy admin cho token này',
            messageResponse: 'Mã xác thực không hợp lệ',
            name: 'JsonWebTokenError',
        });
    } catch (e) {
        return next(
            new ErrorHandler({
                message: `[Middleware CMS] ${e.message}`,
                statusCode: e.statusCode,
                messageResponse: e.messageResponse,
                statusResponse: e.statusResponse,
                name: e.name,
            }),
        );
    }
};

export const roleMiniapp = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = req.headers['x-miniapp-auth'] as string;
        const buf = Buffer.from(process.env.JWT_ACHECKIN_MINIAPP as string, 'base64');
        const decoded = verify(token, buf, { algorithms: ['RS256'] }) as {
            claims: { staff_id: string; workspace_id: string; app_id: string };
        };
        // if (decoded.claims.app_id !== process.env.MINIAPP_BUNDLE_ID) {
        //     throw new ErrorHandler({
        //         message: `Token này không thuộc về app ${process.env.MINIAPP_BUNDLE_ID}`,
        //         messageResponse: 'Mã xác thực không hợp lệ',
        //         name: 'JsonWebTokenError',
        //     });
        // }

        const workspace = decoded?.claims.workspace_id;

        let workspace_hrm = false;

        let workspace_id = decoded?.claims.workspace_id;

        if (workspace.substr(workspace.length - 2) !== 'vn') {
            workspace_hrm = true;
            workspace_id = `${workspace.slice(0, workspace.length - 3)}.vn`;
        }

        const claims = {
            staff_id: decoded?.claims.staff_id,
            workspace_id,
            workspace_hrm,
        };
        return claims;
    } catch (e) {
        return next(
            new ErrorHandler({
                message: `[Middleware MiniApp] ${e.message}`,
                name: e.name,
            }),
        );
    }
};
