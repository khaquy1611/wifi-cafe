import { Request, Response } from 'express';
import {
    Product,
    Customer,
    CategoryProduct,
    Store,
    GroupStore,
    Department,
    SubDepartment,
    Payment,
} from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import sendTelegram from '@svendor/Telegram';

export const productsIndexClient = catchAsync(async (req: Request, res: Response) => {
    const qrCode: string = req.query.q as string;
    if (!qrCode) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng quét mã QR Code để sử dụng dịch vụ tại quán',
        });
    }
    const split: Array<string> = qrCode.split('-');
    const store = await Store.findOne({ id: split[0], active: true }, 'group_id ips');
    if (!store) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin cửa hàng hoặc cửa hàng tạm dừng phục vụ',
        });
    }
    const ip = req.headers['x-real-ip'] as string;
    if (store.ips && store.ips.length) {
        if (!store.ips.includes(ip)) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Vui lòng truy cập WiFi của cửa hàng để sử dụng dịch vụ',
            });
        }
    }
    const data = await Product.find(
        { group_id: store.group_id, store_id: store._id, status: 'available' },
        'name logo desc price category_id tags',
    ).sort('order');
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const categoryProductClient = catchAsync(async (req: Request, res: Response) => {
    const qrCode: string = req.query.q as string;
    if (!qrCode) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng quét mã QR Code để sử dụng dịch vụ tại quán',
        });
    }
    const split: Array<string> = qrCode.split('-');
    const store = await Store.findOne({ id: split[0], active: true }, 'group_id ips');
    if (!store) {
        return res.status(404).json({
            errorCode: 4040,
            message: 'Không có thông tin cửa hàng hoặc cửa hàng tạm dừng phục vụ',
        });
    }
    const ip = req.headers['x-real-ip'] as string;
    if (store.ips && store.ips.length) {
        if (!store.ips.includes(ip)) {
            return res.status(400).json({
                errorCode: 4000,
                message: 'Vui lòng truy cập WiFi của cửa hàng để sử dụng dịch vụ',
            });
        }
    }
    const data = await CategoryProduct.find(
        { group_id: store.group_id, store_id: store._id, active: true },
        'name logo',
    ).sort('order');
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const storesIndexClient = catchAsync(async (req: Request, res: Response) => {
    const qrCode: string = req.query.q as string;
    if (!qrCode) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Vui lòng quét mã QR Code để sử dụng dịch vụ tại quán',
        });
    }
    const split: Array<string> = qrCode.split('-');
    const store = await Store.findOne(
        { id: split[0], active: true },
        'logo name phone_number zalo messenger address group_id',
        {
            lean: true,
        },
    );
    let messsge = 'Mã QR-Code không hợp lệ hoặc cửa hàng tạm dừng phục vụ';
    if (store) {
        const sub_deparment = await SubDepartment.findOne({ id: qrCode, active: true }, 'name department_id id');
        if (sub_deparment) {
            const deparment = await Department.findById(sub_deparment.department_id, 'name department_id active');
            if (deparment && deparment.active === true) {
                const payment_method = await Payment.find(
                    { group_id: store.group_id, store_id: store._id, key: 'payment', active: true },
                    'code desc name phone_number',
                ).sort('order');
                return res.status(200).json({
                    errorCode: 0,
                    message: 'success',
                    data: {
                        store,
                        sub_deparment,
                        deparment,
                        payment_method,
                    },
                });
            }
            messsge = 'Mã QR-Code không hợp lệ hoặc bàn này tạm dừng phục vụ';
        }
        messsge = 'Mã QR-Code không hợp lệ hoặc bàn này tạm dừng phục vụ';
    }
    return res.status(400).json({
        errorCode: 4000,
        message: messsge,
    });
});

export const productsIndexTVClient = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.query;
    let data = [];
    const group = await GroupStore.findOne({ workspace_id: req.body.miniAppUser.workspace_id, active: true }, '_id');
    if (group) {
        data = await Product.find(
            { group_id: group._id, store_id, status: 'available' },
            'name logo desc price category_id tags',
            {
                lean: true,
            },
        ).sort('order');
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const categoryProductTVClient = catchAsync(async (req: Request, res: Response) => {
    const { store_id } = req.query;
    let data = [];
    const group = await GroupStore.findOne({ workspace_id: req.body.miniAppUser.workspace_id, active: true }, '_id');
    if (group) {
        data = await CategoryProduct.find({ group_id: group._id, store_id, active: true }, 'name logo', {
            lean: true,
        }).sort('order');
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const storesIndexTVClient = catchAsync(async (req: Request, res: Response) => {
    if (req.query.machine_id) {
        const data = await Store.findOne(
            { machine_id: req.query.machine_id, active: true },
            'name desc zalo messenger logo address phone_number',
            {
                lean: true,
            },
        );
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
            data,
        });
    }
    const group = await GroupStore.findOne(
        { workspace_id: req.body.miniAppUser.workspace_id, active: true },
        'name desc logo',
    );
    if (group) {
        const { store_id } = req.query;
        const payment = await Payment.find(
            { group_id: group._id, store_id, key: 'payment', active: true },
            'code desc name phone_number',
        ).sort('order');
        const sub_deparment = await SubDepartment.findOne(
            { store_id: store_id as string, active: true },
            'name department_id id',
        );
        const deparment = await Department.findById(sub_deparment?.department_id, 'name department_id active');
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
            data: {
                sub_deparment,
                deparment,
                group,
                payment,
            },
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data: {},
    });
});

export const allStoresIndexTVClient = catchAsync(async (req: Request, res: Response) => {
    const group = await GroupStore.findOne(
        { workspace_id: req.body.miniAppUser.workspace_id, active: true },
        'name desc logo',
    );
    if (!group) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Không tồn tại workspace này',
        });
    }
    const data = await Store.find(
        { group_id: group._id, active: true },
        'name phone_number address logo group_id zalo messenger',
    ).sort('order');
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const customerRegister = catchAsync(async (req: Request, res: Response) => {
    if (req.headers['x-real-ip'] === process.env.IP_SERVER) {
        const { phone_number } = req.body;
        await new Customer({ phone_number }).save();
        sendTelegram({
            message: `ĐĂNG KÝ WIFI CÀ PHÊ \n - SDT: ${phone_number} \n - IP: ${req.headers['x-real-ip'] as string}`,
            key: 'sale',
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const loadStoreByLocation = catchAsync(async (req: Request, res: Response) => {
    const { lat, long } = req.query;
    const data = await Store.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [parseFloat(long as string), parseFloat(lat as string)],
                },
                maxDistance: 5000,
                spherical: true,
                distanceField: 'calculated',
            },
        },
        {
            $project: {
                name: 1,
                desc: 1,
                logo: 1,
                location: 1,
                address: 1,
                phone_number: 1,
                calculated: 1,
                group_id: 1,
            },
        },
    ]);
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
