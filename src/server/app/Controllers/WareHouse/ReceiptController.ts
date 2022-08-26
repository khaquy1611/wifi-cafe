import { Request, Response } from 'express';
import { Receipt, ReceiptItem, ReceiptItemAttribute, ReceiptType, Store, WareHouse } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { createReceiptItem, recalculateDailyLog, saveLogAdmin, createReceiptItemAttribute } from '@sservice/index';
import { getContentPdf } from '@sservice/WareHouse';
import { pick } from 'lodash';
import moment from 'moment';
import pdfmake from 'pdfmake';
import { fonts } from '@shelpers/index';
import { ReceiptItemAttributeResponse, ReceiptItemInputType, ReceiptItemStatusType } from '@stypes/index';

export const create = catchAsync(async (req: Request, res: Response) => {
    const admin = req.body.cmsAdminUser;
    const values = {
        ...pick(req.body, [
            'group_id',
            'store_id',
            'type',
            'receipt_type',
            'code',
            'name',
            'file',
            'desc',
            'link_warehouse',
            'status',
        ]),
    };
    const checkExist = await Receipt.findOne({
        type: values.type,
        code: values.code,
        group_id: values.group_id,
        store_id: values.store_id,
    });
    if (checkExist) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Mã phiếu đã tồn tại',
        });
        return;
    }
    const checkReceiptType = await ReceiptType.findOne({
        type: values.type,
        name: values.receipt_type,
        group_id: values.group_id,
        store_id: values.store_id,
    });
    if (!checkReceiptType) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Loại phiếu không tồn tại',
        });
        return;
    }
    if (
        (values.type === 'import' && values.status === 'export') ||
        (values.type === 'export' && values.status !== 'export')
    ) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Trạng thái phiếu không hợp lệ',
        });
        return;
    }

    let list_operator = [
        {
            name: admin.name,
            action: values.status,
            time: moment().unix(),
        },
    ];
    if (values.status === 'import') {
        list_operator = [
            {
                name: admin.name,
                action: 'order',
                time: moment().unix(),
            },
            {
                name: admin.name,
                action: 'import',
                time: moment().unix(),
            },
        ];
    }

    if (!values.code || values.code === '') {
        const pre = values.type === 'import' ? 'NK' : 'XK';
        const store = await Store.findById(values.store_id);
        const receiptNo = store?.receipt_no ?? 0;
        const pad = '0000';
        const i = pad.substring(0, pad.length - receiptNo.toString().length) + receiptNo;
        values.code = `${pre}${i}`;
        if (store) {
            store.receipt_no += 1;
            await store.save();
        }
    }
    const receipt = await new Receipt({ ...values, list_operator }).save();
    // Create receipt item after save receipt
    if (receipt) {
        const input: {
            receipt_id: string;
            warehouse_id: string;
            quantity: number;
        }[] = values.link_warehouse.map((item: { warehouse_id: string; quantity: number }) => ({
            receipt_id: receipt._id,
            warehouse_id: item.warehouse_id,
            quantity: item.quantity,
        }));
        await createReceiptItemAttribute(input);
        if (receipt.status !== 'order') {
            // eslint-disable-next-line no-restricted-syntax
            for (const item of values.link_warehouse) {
                const receiptype = receipt.type as 'import' | 'export';
                // eslint-disable-next-line no-await-in-loop
                const warehouse: any = await WareHouse.findById(item.warehouse_id);
                if (warehouse) {
                    const value =
                        receiptype === 'import'
                            ? Number(Number(item.quantity).toFixed(3))
                            : Number(Number(item.quantity).toFixed(3)) * -1;
                    const data: ReceiptItemInputType = {
                        ...pick(warehouse, ['group_id', 'store_id', 'name', 'unit']),
                        warehouse_type: warehouse.type,
                        warehouse_id: warehouse._id,
                        note: receiptype === 'import' ? `Nhập kho ${receipt.code}` : `Xuất kho ${receipt.code}`,
                        code: receipt.code,
                        receipt_id: receipt._id,
                        [`${receiptype}_amount`]: value,
                        remain_amount:
                            warehouse.amount +
                            warehouse.import_amount -
                            warehouse.export_amount -
                            warehouse.sell_amount +
                            value,
                    };
                    warehouse[`${receiptype}_amount`] += value;
                    warehouse.save();
                    // eslint-disable-next-line no-await-in-loop
                    await createReceiptItem({
                        data,
                        status: receipt.status as ReceiptItemStatusType,
                    });
                    // eslint-disable-next-line no-await-in-loop
                    await recalculateDailyLog({
                        time: moment().startOf('day').unix(),
                        warehouse_id: warehouse._id,
                        status: receiptype,
                        amount: value,
                    });
                }
            }
        }
    }
    // save log
    await saveLogAdmin({
        name: `thêm mới phiếu ${values.type === 'import' ? 'nhập' : 'xuất'}`,
        type: 'create',
        key: 'ware_house',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id: req.body.group_id,
        store_id: req.body.store_id,
        order_id: req.body.name,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const admin = req.body.cmsAdminUser;
    const values = {
        ...pick(req.body, [
            'group_id',
            'store_id',
            'type',
            'receipt_type',
            'code',
            'name',
            'file',
            'desc',
            'link_warehouse',
            'status',
        ]),
    };
    const data = await Receipt.findById(id);
    if (!data) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Phiếu không tồn tại',
        });
        return;
    }
    if (data.type !== 'import') {
        res.status(400).json({
            errorCode: 4000,
            message: 'Phiếu không hợp lệ',
        });
        return;
    }
    if (data.status !== 'order' || (values.status !== 'order' && values.status !== 'import')) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Trạng thái phiếu không hợp lệ',
        });
        return;
    }
    const checkExist = await Receipt.findOne({
        _id: { $ne: id },
        type: values.type,
        code: values.code,
        group_id: values.group_id,
        store_id: values.store_id,
    });
    if (checkExist) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Mã phiếu đã tồn tại',
        });
        return;
    }
    const checkReceiptType = await ReceiptType.findOne({
        type: values.type,
        name: values.receipt_type,
        group_id: values.group_id,
        store_id: values.store_id,
    });
    if (!checkReceiptType) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Loại phiếu không tồn tại',
        });
        return;
    }

    const list_operator = [
        ...data.list_operator,
        {
            name: admin.name,
            action: 'update',
            time: moment().unix(),
        },
    ];

    if (!values.code || values.code === '') {
        const pre = 'NK';
        const store = await Store.findById(values.store_id);
        const receiptNo = store?.receipt_no ?? 0;
        const pad = '0000';
        const i = pad.substring(0, pad.length - receiptNo.toString().length) + receiptNo;
        values.code = `${pre}${i}`;
        if (store) {
            store.receipt_no += 1;
            await store.save();
        }
    }
    const result = await data.update({ ...values, list_operator });
    if (result) {
        await ReceiptItemAttribute.deleteMany({ receipt_id: data._id });
        const input: {
            receipt_id: string;
            warehouse_id: string;
            quantity: number;
        }[] = values.link_warehouse.map((item: { warehouse_id: string; quantity: number }) => ({
            receipt_id: data._id,
            warehouse_id: item.warehouse_id,
            quantity: item.quantity,
        }));
        await createReceiptItemAttribute(input);
    }
    if (data.status === 'order' && values.status === 'import') {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of values.link_warehouse) {
            // eslint-disable-next-line no-await-in-loop
            const warehouse: any = await WareHouse.findById(item.warehouse_id);
            if (warehouse) {
                const value = Number(Number(item.quantity).toFixed(3));
                const input: ReceiptItemInputType = {
                    ...pick(warehouse, ['group_id', 'store_id', 'name', 'unit']),
                    warehouse_type: warehouse.type,
                    warehouse_id: warehouse._id,
                    note: `Nhập kho ${data.code}`,
                    code: data.code,
                    receipt_id: data._id,
                    import_amount: value,
                    remain_amount:
                        warehouse.amount +
                        warehouse.import_amount -
                        warehouse.export_amount -
                        warehouse.sell_amount +
                        value,
                };
                warehouse.import_amount += value;
                warehouse.save();
                // eslint-disable-next-line no-await-in-loop
                await createReceiptItem({
                    data: input,
                    status: data.status as ReceiptItemStatusType,
                });
                // eslint-disable-next-line no-await-in-loop
                await recalculateDailyLog({
                    time: moment().startOf('day').unix(),
                    warehouse_id: warehouse._id,
                    status: values.status,
                    amount: value,
                });
            }
        }
    }
    // Save log
    await saveLogAdmin({
        name: `chỉnh sửa phiếu nhập`,
        type: 'update',
        key: 'ware_house',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id: req.body.group_id,
        store_id: req.body.store_id,
        order_id: req.body.name,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const list = catchAsync(async (req: Request, res: Response) => {
    const values = req.query as any;
    if (values.from && values.to) {
        values.createdAt = {
            $gte: moment.unix(Number(values.from)).startOf('days').toDate(),
            $lte: moment.unix(Number(values.to)).endOf('days').toDate(),
        };
    }
    if (values.name) {
        values.name = { $regex: values.name, $options: 'i' };
    }
    if (values.code) {
        values.code = { $regex: values.code, $options: 'i' };
    }
    if (values.create_by) {
        values.list_operator = {
            $elemMatch: {
                name: values.create_by,
                action: values.type === 'import' ? 'order' : 'export',
            },
        };
    }
    const total = await Receipt.countDocuments(values);
    const { page } = values;
    delete values.page;
    delete values.from;
    delete values.to;
    const data = await Receipt.find(values)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * 10)
        .limit(10);

    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total,
    });
});

export const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const admin = req.body.cmsAdminUser;
    const receipt = await Receipt.findById(id);
    if (!receipt) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Phiếu không tồn tại',
        });
        return;
    }
    if (receipt.status === 'cancel') {
        res.status(400).json({
            errorCode: 4000,
            message: 'Phiếu đã hủy',
        });
        return;
    }
    if (
        ((receipt.status === 'import' || receipt.status === 'export') && status !== 'cancel') ||
        (receipt.status === 'order' && status !== 'import' && status !== 'cancel')
    ) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Trạng thái không hợp lệ',
        });
        return;
    }
    const list_operator = [
        ...receipt.list_operator,
        {
            name: admin.name,
            action: status,
            time: moment().unix(),
        },
    ];
    await receipt.update({ status, list_operator });
    const receiptItemAttributes = await ReceiptItemAttribute.find({ receipt_id: receipt._id });
    if (receipt.status !== 'order' && receiptItemAttributes.length) {
        const importOperator = receipt.list_operator.find((op) => op.action === receipt.type);
        // eslint-disable-next-line no-restricted-syntax
        for (const item of receiptItemAttributes) {
            const receiptype = receipt.type as 'import' | 'export';
            // eslint-disable-next-line no-await-in-loop
            const warehouse: any = await WareHouse.findById(item.warehouse_id);
            if (warehouse) {
                const amount = Number(Number(item.quantity).toFixed(3));
                warehouse[`${receiptype}_amount`] -= receiptype === 'export' ? amount * -1 : amount;
                // eslint-disable-next-line no-await-in-loop
                await warehouse.save();
                if (importOperator) {
                    // eslint-disable-next-line no-await-in-loop
                    await recalculateDailyLog({
                        time: importOperator.time,
                        warehouse_id: warehouse._id,
                        status: receiptype,
                        amount: amount * -1,
                    });
                }
            }
        }
        await ReceiptItem.updateMany(
            {
                receipt_id: receipt._id,
            },
            {
                note: `Hủy phiếu ${receipt.type === 'import' ? 'nhập' : 'xuất'} ${receipt.code}`,
                status: 'cancel',
            },
        );
    }
    await saveLogAdmin({
        name:
            receipt.status === 'order' && status === 'import'
                ? 'nhập hàng'
                : `hủy phiếu ${receipt.type === 'import' ? 'nhập' : 'xuất'}`,
        type: 'update',
        key: 'ware_house',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id: req.body.group_id,
        store_id: req.body.store_id,
        order_id: receipt.name,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const detail = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { group_id, store_id } = req.query;
    const data = await Receipt.findOne({
        _id: id,
        group_id: group_id as string,
        store_id: store_id as string,
    }).lean();
    if (!data) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Phiếu không tồn tại',
        });
        return;
    }
    let data_warehouse: {
        warehouse_id: string;
        quantity: number;
        name: string;
        unit: string;
    }[] = [];

    const receiptItemAttributes: any = await ReceiptItemAttribute.find({ receipt_id: data._id }).populate({
        path: 'warehouse_id',
        select: '_id name quantity unit',
    });
    if (receiptItemAttributes?.length > 0) {
        data_warehouse = receiptItemAttributes.map((item: ReceiptItemAttributeResponse) => ({
            warehouse_id: item.warehouse_id._id,
            quantity: item.quantity,
            name: item.warehouse_id.name,
            unit: item.warehouse_id.unit,
        }));
    }
    data.link_warehouse = data_warehouse;
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const exportPDF = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { group_id, store_id } = req.query;
    const data = await Receipt.findOne({
        _id: id,
        group_id: group_id as string,
        store_id: store_id as string,
    }).lean();
    if (!data) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Phiếu không tồn tại',
        });
        return;
    }
    const store = await Store.findById(store_id as string);
    if (!store) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Cửa hàng không tồn tại',
        });
        return;
    }
    let data_warehouse: {
        warehouse_id: string;
        quantity: number;
        name: string;
        unit: string;
    }[] = [];

    const receiptItemAttributes: any = await ReceiptItemAttribute.find({ receipt_id: data._id }).populate({
        path: 'warehouse_id',
        select: '_id name quantity unit',
    });
    if (receiptItemAttributes?.length > 0) {
        data_warehouse = receiptItemAttributes.map((item: ReceiptItemAttributeResponse) => ({
            warehouse_id: item.warehouse_id._id,
            quantity: item.quantity,
            name: item.warehouse_id.name,
            unit: item.warehouse_id.unit,
        }));
    }
    data.link_warehouse = data_warehouse;
    const contentPDF = await getContentPdf(data, store.name, store.address);
    // eslint-disable-next-line new-cap
    const printer = new pdfmake(fonts);
    const doc = printer.createPdfKitDocument(contentPDF as any);
    doc.pipe(res);
    doc.end();
});
