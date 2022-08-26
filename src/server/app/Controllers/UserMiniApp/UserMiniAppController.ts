/* eslint-disable no-console */
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { randomString } from '@shelpers/index';
import { Customer, GroupStore, Store, Admin, Order } from '@smodel/index';
import { ROLE_GROUP_ADMIN, ROLE_SUPER_ADMIN, SALT_ROUNDS } from '@sconfig/app';
import catchAsync from '@sexceptions/CatchAsync';
import ErrorHandler from '@sexceptions/index';
import sendMail from '@svendor/SendMail';
import PushMessage from '@svendor/PushMessage';
import FCMPush from '@svendor/FCMPush';

interface DataProps {
    workspace_id: string;
    token: string;
    token_ws: string;
    is_owner?: boolean;
    workspace_hrm?: boolean;
}

const staffInfoACheckin = async ({ token_ws, workspace_id, token, is_owner = false, workspace_hrm }: DataProps) => {
    try {
        if (!token_ws || token_ws !== workspace_id) {
            throw new Error('Workspace không hợp lệ');
        }
        let staff_info = null;
        if (workspace_hrm) {
            staff_info = await axios.get(`${process.env.URL_INFO_ACHECKIN_MINIAPP}?token=${token}`, {
                headers: {
                    'x-api-key': process.env.KEY_ACHECKIN_MINIAPP,
                },
            });
            if (!staff_info.data || staff_info.data.signal !== 1 || !staff_info.data.data) {
                throw new Error('Mã xác thực không hợp lệ');
            }
        } else {
            staff_info = await axios.get(`https://${workspace_id}/api/http/staff-app/staff-info?token=${token}`);
            if (!staff_info.data || staff_info.data.error_code !== 0 || !staff_info.data.data) {
                throw new Error('Mã xác thực không hợp lệ');
            }
        }
        if (is_owner && !staff_info.data.data.is_owner) {
            throw new Error('Không phải là is_owner');
        }
        return staff_info.data.data;
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};

export const postUserMiniapp = catchAsync(async (req: Request, res: Response) => {
    const { workspace_id: workspace, email } = req.body;
    const { workspace_hrm } = req.body.miniAppUser;
    let workspace_id = workspace;
    if (workspace_hrm) {
        workspace_id = `${workspace.slice(0, workspace.length - 3)}.vn`;
    }
    const token_ws = req.body.miniAppUser.workspace_id;
    const token = req.headers['x-miniapp-auth'] as string;
    const staff_info = await staffInfoACheckin({ workspace_id, token, token_ws, workspace_hrm });
    if (staff_info.email !== email) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Email không hợp lệ',
        });
    }
    const groupStore = await GroupStore.findOne({ workspace_id }, '_id');
    if (groupStore) {
        const { phone_number } = staff_info;
        let phone = phone_number;
        if (phone_number && phone_number.startsWith('+84')) {
            phone = phone_number.replace('+84', '0');
        }
        await Customer.findOneAndUpdate(
            { staff_id: staff_info.staff_id, group_id: groupStore._id },
            {
                ...staff_info,
                is_hrm: workspace_hrm,
                staff_id_code: staff_info.id,
                phone_number: phone,
                workspace_id,
                group_id: groupStore._id,
                token,
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            },
        );
        const admin = await Admin.findOne(
            { email, active: true },
            '_id loginAt token token_mini_app login_multi_device role permissions workspace_id',
        );
        if (admin) {
            if (admin.role !== ROLE_SUPER_ADMIN && admin.workspace_id !== workspace_id) {
                return res.status(403).json({
                    errorCode: 4031,
                    message: 'Không có quyền truy cập',
                });
            }
            let token_admin = randomString();
            if (admin.login_multi_device) {
                token_admin = admin._id.toString();
            }
            const jwt_token = sign(
                {
                    data: token_admin,
                    hash: randomString(),
                },
                process.env.JWT_AUTHORIZATION as string,
                { expiresIn: '24h' },
            );
            admin.loginAt = Math.floor(Date.now() / 1000);
            admin.token = token_admin;
            admin.token_mini_app = token;
            await admin.save();
            return res.status(200).json({
                errorCode: 0,
                message: 'success',
                data: {
                    role: admin.role,
                    permissions: admin.permissions,
                    id: admin._id,
                    token: jwt_token,
                },
            });
        }
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data: {},
    });
});

export const statusGroupStore = catchAsync(async (req: Request, res: Response) => {
    const { workspace_id: workspace } = req.body;
    const { workspace_hrm } = req.body.miniAppUser;
    let workspace_id = workspace;
    if (workspace_hrm) {
        workspace_id = `${workspace.slice(0, workspace.length - 3)}.vn`;
    }
    let registed = false;
    let initStore = false;
    const token = req.headers['x-miniapp-auth'] as string;
    const token_ws = req.body.miniAppUser.workspace_id;
    await staffInfoACheckin({ workspace_id, token, token_ws, is_owner: true, workspace_hrm });
    const groupStore = await GroupStore.findOne({ workspace_id }, '_id');
    if (groupStore) {
        registed = true;
        const store = await Store.findOne({ group_id: groupStore._id }, '_id');
        if (store) {
            initStore = true;
        }
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data: {
            registed,
            initStore,
        },
    });
});

export const registerGroupStore = catchAsync(async (req: Request, res: Response) => {
    const { workspace_id: workspace } = req.body;
    const { workspace_hrm } = req.body.miniAppUser;
    let workspace_id = workspace;
    if (workspace_hrm) {
        workspace_id = `${workspace.slice(0, workspace.length - 3)}.vn`;
    }
    const token = req.headers['x-miniapp-auth'] as string;
    const token_ws = req.body.miniAppUser.workspace_id;
    const staff_info = await staffInfoACheckin({ workspace_id, token, token_ws, is_owner: true, workspace_hrm });
    const group = await GroupStore.findOne({ workspace_id });
    const { email, name, is_owner } = staff_info;
    if (group) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Workspace này đã được khởi tạo',
        });
    }
    const admin = await Admin.findOne({ email }, '_id');
    if (admin) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Email này đã được sử dụng',
        });
    }
    const password = randomString(8);
    const groupShop = await new GroupStore({
        name: workspace_id,
        workspace_id,
        id: Math.random().toString(36).substring(2, 15),
    }).save();

    await new Admin({
        name,
        email,
        role: ROLE_GROUP_ADMIN,
        password: bcrypt.hash(password, SALT_ROUNDS),
        is_owner,
        workspace_id,
        groupStores: [groupShop._id],
        token_mini_app: token,
    }).save();
    await sendMail({
        email,
        html: `<div><strong>Chào, ${name}</strong><br />Dịch vụ của bạn đã được khởi tạo thành công.<br />Thông tin tài khoản đăng nhập quản trị<br />- Trang quản lý: ${process.env.API_URL}/login<br />- Tên đăng nhập: ${email}<br />- Mật khẩu: ${password}</div><br>--<div>Thư này được gửi tự động, vui lòng không trả lời thư này. Để biết thêm thông tin bạn có thể liên hệ theo các thông tin bên dưới.<br/>Email: sales@wificaphe.vn<br/>Phone: 0983 723 021<br/></div>`,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const pushNotifyUser = catchAsync(async (req: Request, res: Response) => {
    const { customer_id, order_id } = req.body;
    const order = await Order.findById(order_id);
    if (order) {
        if (order.platform && order.deviceToken) {
            const dataPush = {
                to: order.deviceToken,
                notification: {
                    title: `${order.store} - Nhận đồ uống`,
                    body: `🛎 🛎  Đồ uống của bạn đã được pha chế, bạn vui lòng đến quầy để nhận đồ 🍹`,
                },
            };
            FCMPush({
                data: dataPush,
            });
        } else {
            const customer = await Customer.findById(customer_id);
            if (customer) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let data: any = {
                    token: customer.token,
                    message: `🛎 🛎  Đồ uống của bạn đã được pha chế, bạn vui lòng đến quầy để nhận đồ 🍹`,
                };
                if (customer.is_hrm) {
                    data = {
                        token: customer.token,
                        title: 'Thông báo',
                        body: '🛎 🛎  Đồ uống của bạn đã được pha chế, bạn vui lòng đến quầy để nhận đồ 🍹',
                    };
                }
                PushMessage({
                    is_hrm: customer.is_hrm,
                    workspace_id: customer.workspace_id,
                    data,
                });
            }
        }
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});
