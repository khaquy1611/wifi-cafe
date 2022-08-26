import { Request, Response } from 'express';
import { Product, WareHouse, ProductAttribute, WareHouseDailyLog } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { saveLogAdmin, createReceiptItem, createProductAttribute } from '@sservice/index';
import { ProductType, ReceiptItemInputType } from '@stypes/index';
import { pick } from 'lodash';

export const productsCreate = catchAsync(async (req: Request, res: Response) => {
    const { amount, min_amount, type_warehouse, link_warehouse, store_id } = req.body;
    const product = await new Product({ ...req.body }).save();
    const fixAmount = Number(Number(amount).toFixed(3));
    const fixMinAmount = Number(min_amount).toFixed(3);
    product.type_warehouse = 'off';
    if (amount && min_amount && type_warehouse === 'item') {
        const values = {
            group_id: req.body.group_id,
            store_id: req.body.store_id,
            amount: fixAmount,
            min_amount: fixMinAmount,
            name: req.body.name,
        };
        const item = await new WareHouse({
            ...values,
            type: type_warehouse,
            unit: 'sản phẩm',
            product_id: product._id,
        }).save();
        if (item) {
            const data: ReceiptItemInputType = {
                ...values,
                unit: 'sản phẩm',
                warehouse_type: 'item',
                warehouse_id: item._id,
                import_amount: fixAmount,
                remain_amount: fixAmount,
            };
            await createReceiptItem({ data, status: 'init' });
            await createProductAttribute({
                product_id: product._id,
                warehouse_id: item._id,
                quantity: 1,
            });
        }
        product.type_warehouse = 'item';
    }
    if (type_warehouse === 'ingredient' && link_warehouse.length) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of link_warehouse) {
            // eslint-disable-next-line no-await-in-loop
            const warehouse = await WareHouse.findById(item.id);
            if (warehouse && warehouse.store_id === store_id) {
                // eslint-disable-next-line no-await-in-loop
                await createProductAttribute({
                    product_id: product._id,
                    warehouse_id: item._id,
                    quantity: Number(Number(item.quantity).toFixed(3)),
                });
            }
        }
        product.type_warehouse = 'ingredient';
    }
    await product.save();
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `thêm mới sản phẩm`,
        type: 'create',
        key: 'product',
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

export const productsImport = catchAsync(async (req: Request, res: Response) => {
    const { products, group_id, store_id } = req.body;
    products.map((item: ProductType) => {
        item.group_id = group_id;
        return item;
    });
    await Product.insertMany(products);
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `Import danh sách sản phẩm`,
        type: 'create',
        key: 'product',
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

export const productsUpdate = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { group_id, store_id, amount, min_amount, link_warehouse, type_warehouse } = req.body;
    delete req.body.group_id;
    delete req.body.store_id;
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Sản phẩm không tồn tại');
    }
    if (link_warehouse && type_warehouse === 'ingredient') {
        if (product.type_warehouse === 'item') {
            const productAttribute = await ProductAttribute.findOne({ product_id: product._id });
            if (productAttribute?.warehouse_id) {
                await WareHouse.findOneAndDelete({ _id: productAttribute.warehouse_id, product_id: product._id });
                await WareHouseDailyLog.deleteMany({ warehouse_id: productAttribute.warehouse_id });
            }
        }
        await ProductAttribute.deleteMany({
            product_id: product._id,
        });
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const item of link_warehouse) {
            // eslint-disable-next-line no-await-in-loop
            const warehouse = await WareHouse.findById(item.id);
            if (warehouse) {
                // eslint-disable-next-line no-await-in-loop
                await createProductAttribute({
                    product_id: product._id,
                    ...pick(warehouse, ['name', 'unit']),
                    warehouse_id: warehouse._id,
                    quantity: Number(Number(item.quantity).toFixed(3)),
                });
            }
        }
        product.type_warehouse = type_warehouse;
    }
    if (amount && min_amount && type_warehouse === 'item') {
        if (product.type_warehouse === 'item') {
            throw new Error('Sản phẩm đã có trong kho hàng');
        }
        const fixAmount = Number(Number(amount).toFixed(3));
        const fixMinAmount = Number(min_amount).toFixed(3);
        const values = {
            group_id,
            store_id,
            amount: fixAmount,
            min_amount: fixMinAmount,
            name: req.body.name,
        };
        const item = await new WareHouse({ ...values, type: 'item', unit: 'sản phẩm', product_id: product._id }).save();
        if (item) {
            await ProductAttribute.deleteMany({
                product_id: product._id,
            });
            const data: ReceiptItemInputType = {
                ...values,
                unit: 'sản phẩm',
                warehouse_type: 'item',
                warehouse_id: item._id,
                import_amount: fixAmount,
                remain_amount: fixAmount,
            };
            await createReceiptItem({ data, status: 'init' });
            await createProductAttribute({
                product_id: product._id,
                ...pick(item, ['name', 'unit']),
                warehouse_id: item._id,
                quantity: 1,
            });
        }
        product.type_warehouse = 'item';
    }
    if (type_warehouse === 'off') {
        if (product.type_warehouse === 'item' || product.type_warehouse === 'ingredient') {
            const productAttribute = await ProductAttribute.findOne({ product_id: product._id });
            if (productAttribute) {
                if (product.type_warehouse === 'item') {
                    const deletedWarehouse = await WareHouse.findOneAndDelete({
                        _id: productAttribute?.warehouse_id,
                        product_id: product._id,
                    });
                    if (deletedWarehouse) {
                        const data: ReceiptItemInputType = {
                            ...pick(deletedWarehouse, ['group_id', 'store_id', 'amount', 'min_amount', 'name', 'unit']),
                            warehouse_id: deletedWarehouse._id,
                            export_amount: 1,
                            remain_amount: 0,
                            note: 'Hủy quản lý kho',
                        };
                        await createReceiptItem({ data, status: 'delete' });
                        await WareHouseDailyLog.deleteMany({ warehouse_id: deletedWarehouse._id });
                    }
                }
                await ProductAttribute.deleteMany({
                    product_id: product._id,
                });
            }
        }
        product.type_warehouse = 'off';
    }
    await product.updateOne(req.body);
    await product.save();
    if (product) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `sửa sản phẩm`,
            type: 'edit',
            key: 'product',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id,
            store_id,
            order_id: req.body.name,
        });
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const productsDelete = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { group_id, store_id } = req.body;
    const product = await Product.findOneAndDelete({ group_id: group_id as string, store_id, _id: productId });

    if (product) {
        if (product.type_warehouse === 'item') {
            const productAttribute = await ProductAttribute.findOne({ product_id: product._id });
            const deletedWarehouse = await WareHouse.findOneAndDelete({
                _id: productAttribute?.warehouse_id,
                product_id: product._id,
            });
            if (deletedWarehouse) {
                const data: ReceiptItemInputType = {
                    ...pick(deletedWarehouse, ['group_id', 'store_id', 'amount', 'min_amount', 'name', 'unit']),
                    warehouse_id: deletedWarehouse._id,
                    export_amount: 1,
                    remain_amount: 0,
                    note: 'Xóa mặt hàng',
                };
                await createReceiptItem({ data, status: 'delete' });
                await WareHouseDailyLog.deleteMany({ warehouse_id: deletedWarehouse._id });
            }
        }
        await ProductAttribute.deleteMany({
            product_id: product._id,
        });

        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `xoá sản phẩm`,
            type: 'delete',
            key: 'product',
            order_id: product.name,
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id: req.body.group_id,
            store_id: req.body.store_id,
        });
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(404).json({
        errorCode: 4000,
        message: 'failed',
    });
});

export const productsIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id } = req.query;
    const data = await Product.find({ group_id: group_id as string, store_id }).sort({
        order: 1,
        createdAt: -1,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});

export const productDetail = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { group_id, store_id } = req.query;
    const data = await Product.findOne({ group_id: group_id as string, store_id, _id: productId }).lean();
    if (!data) {
        throw new Error('Không tìm thấy sản phẩm');
    }
    if (data.type_warehouse === 'item') {
        const res: any = await ProductAttribute.findOne({ product_id: data._id }).populate({
            path: 'warehouse_id',
            select: 'name unit amount min_amount _id',
        });
        data.amount = res?.warehouse_id.amount;
        data.min_amount = res?.warehouse_id.min_amount;
    } else {
        const productAttributes: any[] = await ProductAttribute.find({ product_id: data._id }).populate({
            path: 'warehouse_id',
            select: 'name unit amount min_amount _id',
        });
        let attributes: {
            id: string;
            quantity: number;
            name: string;
            unit: string;
            amount: number;
            min_amount: number;
        }[] = [];
        if (productAttributes.length > 0) {
            attributes = productAttributes.map((item) => ({
                id: item.warehouse_id._id,
                quantity: item.quantity,
                name: item.warehouse_id.name,
                unit: item.warehouse_id.unit,
                amount: item.warehouse_id.amount,
                min_amount: item.warehouse_id.min_amount,
            }));
        }
        data.link_warehouse = attributes;
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
