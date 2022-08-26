import { Request, Response } from 'express';
import { WareHouse, ReceiptItem, ProductAttribute } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { saveLogAdmin, createReceiptItem, queryInventoryList, queryInventoryStreamList } from '@sservice/index';
import { pick } from 'lodash';
import { WareHouseImportType, WareHouseType, ReceiptItemInputType, WarehouseQueryConditionType } from '@stypes/index';
import { randomString } from '@shelpers/index';
import path from 'path';
import moment from 'moment';
import Excel from 'exceljs';

export const wareHouseCreate = catchAsync(async (req: Request, res: Response) => {
    const values = req.body;
    const fixAmount = Number(values.amount).toFixed(3);
    const fixMinAmount = Number(values.min_amount).toFixed(3);
    values.amount = fixAmount;
    values.min_amount = fixMinAmount;
    const checkExist = await WareHouse.findOne({
        type: 'ingredient',
        name: values.name,
        group_id: values.group_id,
        store_id: values.store_id,
    });
    if (checkExist) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Tên nguyên liệu đã tồn tại',
        });
        return;
    }
    const wareHouse = await new WareHouse(values).save();
    if (wareHouse) {
        values.warehouse_id = wareHouse._id as string;
        values.warehouse_type = values.type;
        values.import_amount = values.amount;
        values.remain_amount = values.amount;
        await createReceiptItem({ data: values, status: 'init' });
    }
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `thêm mới nguyên liệu/ mặt hàng`,
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

export const wareHouseIndex = catchAsync(async (req: Request, res: Response) => {
    const values = {
        ...pick(req.query, ['group_id', 'store_id', 'type']),
    } as WarehouseQueryConditionType;
    const sort = { createdAt: -1 };
    const { name } = req.query;
    if (name) {
        values.name = { $regex: name as string, $options: 'i' };
    }
    const total = await WareHouse.count(values);
    const { page, limit } = req.query;
    const skip = limit ? (Number(page) - 1) * Number(limit) : 0;
    const data = await queryInventoryList({
        condition: values,
        sort,
        skip,
        limit: limit ? Number(limit) : 10,
        status: req.query.status as string,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total,
    });
});

export const wareHouseImport = catchAsync(async (req: Request, res: Response) => {
    const { ware_houses, group_id, store_id } = req.body;
    ware_houses.forEach((item: WareHouseImportType) => {
        item.group_id = group_id;
        item.store_id = store_id;
        item.amount = Number(item.amount.toFixed(3));
        item.min_amount = Number(item.min_amount.toFixed(3));
    });
    const listName = ware_houses.map((item: WareHouseType) => item.name);
    const checkExist = await WareHouse.find({
        type: 'ingredient',
        name: { $in: listName },
        group_id,
        store_id,
    });
    const listNameExist = checkExist.map((item: WareHouseType) => item.name);
    if (ware_houses) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of ware_houses) {
            const isExistName = listNameExist.includes(item.name);
            const input = {
                ...pick(item, ['group_id', 'store_id', 'name', 'amount', 'min_amount', 'unit']),
                warehouse_type: item.type,
            } as ReceiptItemInputType;
            let warehouse;
            if (isExistName) {
                // eslint-disable-next-line no-await-in-loop
                warehouse = await WareHouse.updateOne(
                    { name: item.name },
                    {
                        ...pick(item, ['group_id', 'store_id', 'name', 'amount', 'min_amount', 'unit', 'type']),
                    },
                );
            } else {
                // eslint-disable-next-line no-await-in-loop
                warehouse = await new WareHouse({
                    ...pick(item, ['group_id', 'store_id', 'name', 'amount', 'min_amount', 'unit', 'type']),
                }).save();
            }
            if (warehouse) {
                input.warehouse_id = warehouse._id as string;
                // eslint-disable-next-line no-await-in-loop
                await createReceiptItem({ data: input, status: 'init' });
            }
        }
    }
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `Import danh sách nguyên liệu/ mặt hàng`,
        type: 'create',
        key: 'ware_house',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id,
        store_id,
        order_id: '',
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const wareHouseUpdate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const values = pick(req.body, ['name', 'unit', 'min_amount']);
    const record = await WareHouse.findById(id);
    if (!record) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy dữ liệu',
        });
        return;
    }
    if (record.type === 'item' && (values.name !== record.name || values.unit !== record.unit)) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Không thể sửa tên, đơn vị của sản phẩm',
        });
        return;
    }
    if (record.type === 'ingredient') {
        const checkExist = await WareHouse.findOne({
            type: 'ingredient',
            name: values.name,
            _id: { $ne: id },
            group_id: record.group_id,
            store_id: record.store_id,
        });
        if (checkExist) {
            res.status(400).json({
                errorCode: 4000,
                message: 'Tên nguyên liệu đã tồn tại',
            });
            return;
        }
    }
    await WareHouse.findByIdAndUpdate(id, values);
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `sửa nguyên liệu/ mặt hàng`,
        type: 'edit',
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

export const wareHouseDelete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { group_id, store_id } = req.body;
    const record = (await WareHouse.findById(id)) as WareHouseType;
    if (!record) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Không tìm thấy dữ liệu',
        });
    }
    const checkExistInProduct = await ProductAttribute.find({
        warehouse_id: id,
    });
    if (checkExistInProduct.length) {
        // Case warehouse type = item, only delete warehouse when delete product or unlink warehouse
        res.status(400).json({
            errorCode: 4000,
            message: 'Không thể xóa nguyên liệu đang được sử dụng',
        });
        return;
    }
    const deletedDoc = await WareHouse.findOneAndDelete({ _id: id, group_id, store_id });
    if (deletedDoc) {
        const input = {
            ...pick(deletedDoc, ['group_id', 'store_id', 'name', 'amount', 'min_amount', 'unit']),
            warehouse_type: deletedDoc.type,
        } as ReceiptItemInputType;
        input.note = 'Xóa nguyên liệu';
        await createReceiptItem({ data: input, status: 'delete' });
        await ReceiptItem.updateMany({ warehouse_id: id }, { $set: { deleted: true } });
    }
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `xóa nguyên liệu/ mặt hàng`,
        type: 'delete',
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

export const wareHouseHistory = catchAsync(async (req: Request, res: Response) => {
    const { page, from, to } = req.query;
    const conditions = { ...pick(req.query, ['name']) } as {
        name?:
            | {
                  $regex: string;
                  $options: string;
              }
            | string;
        createdAt?: {
            $gte: Date;
            $lte: Date;
        };
    };
    if (conditions.name) {
        conditions.name = { $regex: conditions.name as string, $options: 'i' };
    }
    if (from) {
        conditions.createdAt = {
            $gte: moment.unix(Number(from)).startOf('days').toDate(),
            $lte: to ? moment.unix(Number(to)).endOf('days').toDate() : moment().endOf('days').toDate(),
        };
    }
    const total = await ReceiptItem.countDocuments(conditions);
    const skip = page ? (Number(page) - 1) * 10 : 0;
    const data = await ReceiptItem.find(conditions).sort('-updatedAt').skip(skip).limit(10).lean();
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        total,
        data,
    });
});

export const exportListWarehouse = catchAsync(async (req: Request, res: Response) => {
    const values = {
        ...pick(req.query, ['group_id', 'store_id', 'type']),
    } as WarehouseQueryConditionType;
    const sort = { createdAt: -1 };
    const { name } = req.query;
    if (name) {
        values.name = { $regex: name as string, $options: 'i' };
    }
    const list: any = await queryInventoryStreamList({
        condition: values,
        sort,
        status: req.query.status as string,
    });
    const fileName = randomString();
    const storagePath = `${path.resolve('server', 'storage')}/${fileName}.csv`;
    let doc;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('BÁO CÁO NGUYÊN LIỆU');
    worksheet.columns = [
        { header: 'Tên nguyên liệu/ sản phẩm', key: 'name', width: 35 },
        { header: 'Đơn vị', key: 'unit', width: 20 },
        { header: 'Số lượng tối thiểu', key: 'min_amount', width: 15 },
        { header: 'Số lượng cuối kỳ', key: 'remainAmount', width: 15 },
        { header: 'Trạng thái', key: 'status', width: 20 },
    ];
    // eslint-disable-next-line no-await-in-loop,no-cond-assign
    while ((doc = await list.next())) {
        doc.status = doc.status === 'low' ? 'Sắp hết hàng' : doc.status === 'empty' ? 'Hết hàng' : 'Còn hàng';
        worksheet.addRow(doc);
    }
    await workbook.xlsx.writeFile(storagePath);
    res.download(storagePath, 'danh_sach_nguyen_vat_lieu_ton_kho.xlsx');
});
