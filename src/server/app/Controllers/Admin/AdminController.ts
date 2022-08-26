import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import moment from 'moment';
import speakeasy from 'speakeasy';
import sendMail from '@svendor/SendMail';
import catchAsync from '@sexceptions/CatchAsync';
import { sign, verify } from 'jsonwebtoken';
import { setCookie, parseCookies } from 'nookies';
import { randomString } from '@shelpers/index';
import { ROLE_ADMIN, ROLE_GROUP_ADMIN, ROLE_SUPER_ADMIN, SALT_ROUNDS, HIDE_SELECT_ADMIN } from '@sconfig/app';
import { AdminType } from '@stypes/index';
import { encrypt, decrypt } from '@svendor/Crypto';
import { Admin, GroupStore } from '@smodel/index';
import { getIosTokenIob } from '@squeue/index';

export const adminCreate = async (req: Request, res: Response) => {
    const {
        password,
        name,
        email,
        role,
        stores,
        permissions,
        group_id,
        role_permissions,
        avatar,
        cmsAdminUser,
        login_multi_device,
        active,
    } = req.body;
    const admin = cmsAdminUser;
    if (admin.role === ROLE_SUPER_ADMIN || admin.role === ROLE_GROUP_ADMIN) {
        const adminEmail = await Admin.findOne({ email }, 'email');
        if (adminEmail) {
            return res.status(400).json({
                errorCode: 4040,
                message: 'Email này đã được đăng ký',
            });
        }
        const passHash = await bcrypt.hash(password, SALT_ROUNDS);
        const body: AdminType = {
            name,
            email,
            password: passHash,
            login_multi_device,
            active,
            groupStores: [],
            secret_pin: '',
        };
        body.groupStores = [group_id];
        if (stores) {
            body.stores = stores;
        }
        if (avatar) {
            body.avatar = avatar;
        }
        const group = await GroupStore.findById(group_id, 'workspace_id');
        if (group && group.workspace_id) {
            body.workspace_id = group.workspace_id;
        }
        if (role) {
            if (admin.role === ROLE_SUPER_ADMIN) {
                body.role = role;
            } else if (admin.role === ROLE_GROUP_ADMIN) {
                if (role === ROLE_GROUP_ADMIN || role === ROLE_ADMIN) {
                    body.role = role;
                }
            }
        }
        if (permissions && role_permissions && role === ROLE_ADMIN) {
            body.permissions = permissions;
            body.role_permissions = role_permissions;
        }
        const html = `<div><strong>Chào, ${name}</strong><br />Tài khoản của bạn đã được khởi tạo thành công.<br />Thông tin tài khoản đăng nhập quản trị<br />- Trang quản lý: ${process.env.API_URL}/login<br />- Tên đăng nhập: ${email}<br />- Mật khẩu: ${password}</div>--<div>Thư này được gửi tự động, vui lòng không trả lời thư này. Để biết thêm thông tin bạn có thể liên hệ theo các thông tin bên dưới.<br/>Email: sales@wificaphe.vn<br/>Phone: 0983 723 021<br/></div>`;
        await new Admin(body).save();
        await sendMail({
            email,
            html,
        });
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(403).json({
        errorCode: 4031,
        message: 'Không có quyền truy cập',
    });
};

export const adminUpdate = catchAsync(async (req: Request, res: Response) => {
    const {
        name,
        role,
        stores,
        permissions,
        role_permissions,
        avatar,
        active,
        login_multi_device,
        two_factor,
    } = req.body;
    const { adminId } = req.params;
    const { tokenqr } = parseCookies({ req });
    const token = req.header('Authorization') || tokenqr;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true });
    if (!admin) {
        return res.status(403).json({
            errorCode: 4031,
            message: 'Không có quyền sửa chính bạn',
        });
    }
    if (adminId === admin._id.toString()) {
        const adminUpdate = await Admin.findById(adminId);
        if (adminUpdate) {
            if (name) {
                adminUpdate.name = name;
            }
            adminUpdate.two_factor = two_factor;
            adminUpdate.login_multi_device = login_multi_device;
            if (avatar) {
                adminUpdate.avatar = avatar;
            }
            if (two_factor && !adminUpdate.secret_pin) {
                const temp_secret = await speakeasy.generateSecret({ name: 'wificaphe.com' });
                adminUpdate.secret_pin = temp_secret.base32;
                adminUpdate.secret_url = temp_secret.otpauth_url;
            }
            await adminUpdate.save();
            return res.status(200).json({
                errorCode: 0,
                message: 'success',
            });
        }
        return res.status(403).json({
            errorCode: 4031,
            message: 'Không có quyền sửa chính bạn',
        });
    }
    if (admin.role === ROLE_SUPER_ADMIN || admin.role === ROLE_GROUP_ADMIN) {
        const adminEdit = await Admin.findById(adminId);
        if (adminEdit) {
            if (adminEdit.role === ROLE_SUPER_ADMIN && admin.role === ROLE_GROUP_ADMIN) {
                return res.status(403).json({
                    errorCode: 4031,
                    message: 'Không có quyền sửa quản trị viên này',
                });
            }
            if (role) {
                if (admin.role === ROLE_SUPER_ADMIN) {
                    adminEdit.role = role;
                } else if (admin.role === ROLE_GROUP_ADMIN) {
                    if (role === ROLE_GROUP_ADMIN || role === ROLE_ADMIN) {
                        adminEdit.role = role;
                    }
                }
            }
            adminEdit.active = active;
            adminEdit.login_multi_device = login_multi_device;
            if (stores) {
                adminEdit.stores = stores;
            }
            if (avatar) {
                adminEdit.avatar = avatar;
            }
            adminEdit.name = name;
            if (permissions && role_permissions && adminEdit.role === ROLE_ADMIN) {
                adminEdit.permissions = permissions;
                adminEdit.role_permissions = role_permissions;
            }
            await adminEdit.save();
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(403).json({
        errorCode: 4031,
        message: 'Không có quyền truy cập',
    });
});

export const adminDelete = catchAsync(async (req: Request, res: Response) => {
    const { adminId } = req.params;
    const admin = req.body.cmsAdminUser;
    if (adminId === admin._id.toString()) {
        return res.status(403).json({
            errorCode: 4031,
            message: 'Không có quyền xoá chính bạn',
        });
    }
    if (admin.role === ROLE_SUPER_ADMIN || admin.role === ROLE_GROUP_ADMIN) {
        const adminEdit = await Admin.findById(adminId);
        if (adminEdit) {
            if (adminEdit.role === ROLE_SUPER_ADMIN && admin.role === ROLE_GROUP_ADMIN) {
                return res.status(403).json({
                    errorCode: 4031,
                    message: 'Không có quyền truy cập',
                });
            }
            await adminEdit.deleteOne();
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(403).json({
        errorCode: 4031,
        message: 'Không có quyền truy cập',
    });
});

export const adminInfo = catchAsync(async (req: Request, res: Response) => {
    const { adminId } = req.params;
    const { deviceToken, platform } = req.query;
    const { tokenqr } = parseCookies({ req });
    const token = req.header('Authorization') || tokenqr;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true }, 'role groupStores');
    let adminInfoId = admin?._id;
    if (admin) {
        if (admin.role === ROLE_SUPER_ADMIN) {
            adminInfoId = adminId;
        } else if (admin.role === ROLE_GROUP_ADMIN) {
            const adminGroup = await Admin.findById(adminId, 'groupStores role');
            if (adminGroup?.role !== ROLE_SUPER_ADMIN) {
                const checkRole = (element: string) => admin.groupStores.includes(element);
                const resultRole = adminGroup?.groupStores.some(checkRole);
                if (!resultRole) {
                    return res.status(403).json({
                        errorCode: 4031,
                        message: 'Không có quyền truy cập',
                    });
                }
            }
            adminInfoId = adminId;
        }
    }
    let select = HIDE_SELECT_ADMIN;
    if (admin?._id.toString() === adminId) {
        select = '-password -token -role_permissions -secret_pin -token_mini_app -device_token';
    }
    const data = await Admin.findById(adminInfoId, select);
    if (data && deviceToken && platform) {
        data.deviceToken = deviceToken as string;
        data.platform = platform as string;
        if (deviceToken && platform === 'ios') {
            getIosTokenIob({ id: data._id, type: 'admin' });
        }
        await data.save();
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const adminIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id } = req.query;
    const admin = req.body.cmsAdminUser;
    let body = {};
    if (admin.role === ROLE_SUPER_ADMIN) {
        body = { $or: [{ groupStores: group_id as string }, { role: ROLE_SUPER_ADMIN }] };
    } else if (admin.role === ROLE_GROUP_ADMIN) {
        body = { groupStores: group_id as string, role: { $ne: ROLE_SUPER_ADMIN } };
    }
    const data = await Admin.find(body, HIDE_SELECT_ADMIN);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const adminChangePassword = catchAsync(async (req: Request, res: Response) => {
    const { password } = req.body;
    const { adminId } = req.params;
    const { tokenqr } = parseCookies({ req });
    const token = req.header('Authorization') || tokenqr;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true });
    if (!admin) {
        return res.status(403).json({
            errorCode: 4031,
            message: 'Không có quyền truy cập',
        });
    }
    if (adminId === admin._id.toString()) {
        const adminUpdate = await Admin.findById(adminId);
        if (adminUpdate) {
            adminUpdate.password = await bcrypt.hash(password, SALT_ROUNDS);
            await adminUpdate.save();
            return res.status(200).json({
                errorCode: 0,
                message: 'success',
            });
        }
        return res.status(403).json({
            errorCode: 4031,
            message: 'Không có quyền sửa chính bạn',
        });
    }
    if (admin.role === ROLE_SUPER_ADMIN || admin.role === ROLE_GROUP_ADMIN) {
        const adminEdit = await Admin.findById(adminId);
        if (adminEdit) {
            if (adminEdit.role === ROLE_SUPER_ADMIN && admin.role === ROLE_GROUP_ADMIN) {
                return res.status(403).json({
                    errorCode: 4031,
                    message: 'Không có quyền sửa quản trị viên này',
                });
            }
            adminEdit.password = await bcrypt.hash(password, SALT_ROUNDS);
            await adminEdit.save();
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(403).json({
        errorCode: 4031,
        message: 'Không có quyền truy cập',
    });
});

export const adminRequestResetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, token } = req.body;
    const adminEmail = await Admin.findOne({ email }, 'email name secret_pin two_factor');
    if (adminEmail) {
        if (adminEmail.two_factor && adminEmail.secret_pin) {
            const secret = adminEmail.secret_pin;
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token,
            });
            if (!verified) {
                return res.status(400).json({
                    errorCode: 4000,
                    message: 'Email hoặc mã pin không đúng',
                });
            }
        }
        const jwt_token = sign(
            {
                d: encrypt(adminEmail._id.toString()),
                hash: randomString(),
            },
            process.env.JWT_AUTHORIZATION_SOCKET as string,
            { expiresIn: '1h' },
        );
        const html = `<div><strong>Chào, ${
            adminEmail.name
        }</strong><br />Bạn đã yêu cầu đổi mật khẩu vào lúc ${moment().format(
            'DD/MM/YYYY HH:mm:ss',
        )} trên địa chỉ IP: ${req.headers['x-real-ip']}.<br />- Nếu đúng là bạn vui lòng click vào link này <a href='${
            process.env.API_URL
        }/login?tab=3&token=${jwt_token}'>${
            process.env.API_URL
        }/login?tab=3&token=${jwt_token}</a><br />- Link này có hiệu lực trong vòng một giờ<br />- Nếu không phải là bạn vui lòng bỏ qua thư này</div>--<div>Thư này được gửi tự động, vui lòng không trả lời thư này. Để biết thêm thông tin bạn có thể liên hệ theo các thông tin bên dưới.<br/>Email: sales@wificaphe.vn<br/>Phone: 0983 723 021<br/></div>`;
        await sendMail({
            email,
            html,
            subject: 'Yêu cầu đổi mật khẩu trên hệ thống Wifi Cà Phê',
            text: 'Yêu cầu đổi mật khẩu trên hệ thống Wifi Cà Phê',
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'Yêu cầu đổi mật khẩu thành công',
    });
});

export const adminNewResetPassword = catchAsync(async (req: Request, res: Response) => {
    const { password } = req.body;
    const token = req.header('Authorization') as string;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION_SOCKET as string) as { d: string };
    const adminEmail = await Admin.findById(decrypt(jwtToken.d));
    if (adminEmail) {
        adminEmail.password = await bcrypt.hash(password, SALT_ROUNDS);
        await adminEmail.save();
        const html = `<div><strong>Chào, ${
            adminEmail.name
        }</strong><br />Tài khoản của bạn đã đổi mật khẩu vào lúc ${moment().format(
            'DD/MM/YYYY HH:mm:ss',
        )} trên địa chỉ IP: ${
            req.headers['x-real-ip']
        }.<br />- Nếu đó không phải là bạn vui lòng liên hệ thông tin bên dưới đê được hỗ trợ</div>--<div>Thư này được gửi tự động, vui lòng không trả lời thư này. Để biết thêm thông tin bạn có thể liên hệ theo các thông tin bên dưới.<br/>Email: sales@wificaphe.vn<br/>Phone: 0983 723 021<br/></div>`;
        await sendMail({
            email: adminEmail.email,
            html,
            subject: 'Đổi mật khẩu thành công trên hệ thống Wifi Cà Phê',
            text: 'Đổi mật khẩu thành công trên hệ thống Wifi Cà Phê',
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'Bạn đã đổi mật khẩu thành công',
    });
});

export const adminLogout = catchAsync(async (req: Request, res: Response) => {
    const { admin_id } = req.body;
    const { tokenqr } = parseCookies({ req });
    const token = req.header('Authorization') || tokenqr;
    const jwtToken = verify(token, process.env.JWT_AUTHORIZATION as string) as { data: string };
    const admin = await Admin.findOne({ token: jwtToken.data, active: true }, '_id login_multi_device');
    if (!admin || admin._id.toString() !== admin_id) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin admin',
        });
    }
    res.clearCookie('tokenqr');
    if (!admin.login_multi_device) {
        admin.token = randomString();
        await admin.save();
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const adminLogin = async (req: Request, res: Response) => {
    const { password, email, token } = req.body;
    const data = await Admin.findOne(
        { email, active: true },
        'name email password loginAt token role two_factor secret_pin login_multi_device',
    );
    if (!data) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Email hoặc mật khẩu không đúng',
        });
    }
    const match = await bcrypt.compare(password, data.password);
    if (!match) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Email hoặc mật khẩu không đúng',
        });
    }
    if (data.two_factor) {
        if (!token) {
            return res.status(200).json({
                errorCode: 0,
                message: 'Enter OTP',
            });
        }
        const secret = data.secret_pin;
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
        });
        if (!verified) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Email hoặc mật khẩu hoặc mã pin không đúng',
            });
        }
    }
    let token_admin = randomString();
    if (data.login_multi_device) {
        token_admin = data._id.toString();
    }
    const jwt_token = sign(
        {
            data: token_admin,
            hash: randomString(),
        },
        process.env.JWT_AUTHORIZATION as string,
        { expiresIn: '168h' },
    );
    data.loginAt = Math.floor(Date.now() / 1000);
    data.token = token_admin;
    await data.save();
    setCookie({ res }, 'tokenqr', jwt_token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60,
    });
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data: {
            token: jwt_token,
            id: data._id,
            name: data.name,
        },
    });
};
